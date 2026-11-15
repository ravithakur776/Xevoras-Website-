import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth/session';
import { MeeshoAdapter } from '@/lib/adapters/meesho.adapter';
import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { CatalogueSyncService } from '@/lib/services/catalogueSync.service';
import { CatalogService } from '@/lib/services/catalog.service';
import { normalizeImageUrl } from '@/lib/utils/image';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { action = 'autofill', url, productData, customImageUrl, customCostPaise, customPricePaise } = body;

    if (!url && !productData?.sourceUrl) {
      return NextResponse.json({ error: 'Meesho product URL is required.' }, { status: 400 });
    }

    const targetUrl = url || productData.sourceUrl;

    // Validate URL
    const validation = MeeshoAdapter.validateUrl(targetUrl);
    if (!validation.valid || !validation.cleanUrl) {
      return NextResponse.json({ error: validation.error || 'Invalid Meesho link' }, { status: 400 });
    }

    const sanitizedCustomImage = customImageUrl ? normalizeImageUrl(customImageUrl) : undefined;

    // 1. AUTOFILL ACTION
    if (action === 'autofill') {
      const generated = MeeshoAdapter.parseAndGenerateProduct(
        validation.cleanUrl,
        sanitizedCustomImage,
        customCostPaise,
        customPricePaise
      );

      generated.coverImage = normalizeImageUrl(generated.coverImage);
      if (Array.isArray(generated.galleryImages)) {
        generated.galleryImages = generated.galleryImages.map((img) => normalizeImageUrl(img));
      }

      return NextResponse.json({
        success: true,
        autoFilled: generated,
      });
    }

    // 2. PUBLISH ACTION (1-Click Publish or Update to Database & Live Storefront)
    if (action === 'publish' || action === 'instant_publish') {
      // If productData was passed from frontend form use it, else generate fresh from URL
      const dataToSave = productData?.name
        ? { ...productData }
        : MeeshoAdapter.parseAndGenerateProduct(
            validation.cleanUrl,
            sanitizedCustomImage,
            customCostPaise,
            customPricePaise
          );

      // Normalize images
      const coverImg = normalizeImageUrl(dataToSave.coverImage || sanitizedCustomImage || '/media/products/women-1.jpg');
      dataToSave.coverImage = coverImg;

      // Verify category exists in DB (fallback to women-dresses if not found)
      let categoryId = dataToSave.categoryId;
      const catExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!catExists) {
        const fallbackCat = await prisma.category.findFirst({ where: { gender: dataToSave.gender } });
        categoryId = fallbackCat ? fallbackCat.id : 'women-dresses';
      }

      // Check if product already exists by exact cleanUrl or slug
      const cleanUrl = validation.cleanUrl;
      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { slug: dataToSave.slug },
            { supplierSourceUrl: cleanUrl },
          ],
        },
        include: {
          variants: true,
          media: true,
        },
      });

      // Prepare variants list
      const rawVariants = Array.isArray(dataToSave.variants) && dataToSave.variants.length > 0
        ? dataToSave.variants
        : [
            { size: 'S', stockCount: 15 },
            { size: 'M', stockCount: 25 },
            { size: 'L', stockCount: 30 },
            { size: 'XL', stockCount: 20 },
            { size: 'XXL', stockCount: 10 },
          ];

      // Execute Atomic Database Transaction (Upsert / Update or Create)
      const savedProduct = await prisma.$transaction(async (tx) => {
        let prod: any;

        if (existingProduct) {
          // --- UPDATE PATH ---
          prod = await tx.product.update({
            where: { id: existingProduct.id },
            data: {
              name: dataToSave.name,
              description: dataToSave.description,
              shortDescription: `${dataToSave.fabric} · ${dataToSave.fit} · Always Rare`,
              gender: dataToSave.gender,
              categoryId,
              pricePaise: Number(dataToSave.pricePaise) || existingProduct.pricePaise,
              compareAtPricePaise: Number(dataToSave.compareAtPricePaise) || existingProduct.compareAtPricePaise,
              costPricePaise: Number(dataToSave.costPricePaise) || existingProduct.costPricePaise,
              fabric: dataToSave.fabric,
              pattern: dataToSave.pattern,
              fit: dataToSave.fit,
              occasion: dataToSave.occasion,
              sleeveType: dataToSave.sleeveType || 'Comfort Tailored',
              neckType: dataToSave.neckType || 'Classic Elegant',
              careInstructions: dataToSave.careInstructions,
              status: 'PUBLISHED',
              featured: true,
              isNewArrival: true,
              isTrending: true,
              sourcingType: 'MEESHO',
              supplierStatus: 'VERIFIED',
              supplierSourceUrl: cleanUrl,
              supplierNotes: `Auto-updated from Meesho link: ${cleanUrl}. Sourcing cost: ₹${((Number(dataToSave.costPricePaise) || 49900) / 100).toFixed(0)}`,
              supplierVerificationDate: new Date(),
              updatedAt: new Date(),
            },
          });

          // Replace Media
          await tx.productMedia.deleteMany({ where: { productId: prod.id } });
          await tx.productMedia.create({
            data: {
              productId: prod.id,
              url: coverImg,
              altText: `${prod.name} - Front View`,
              sortOrder: 0,
              isCover: true,
            },
          });

          // Replace Variants safely with guaranteed collision-free SKUs
          await tx.productVariant.deleteMany({ where: { productId: prod.id } });
          for (const v of rawVariants) {
            let variantSku = `XV-${prod.slug.slice(0, 10).toUpperCase()}-${String(v.size).toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
            const skuCollision = await tx.productVariant.findUnique({ where: { sku: variantSku } });
            if (skuCollision) {
              variantSku = `${variantSku}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            }

            await tx.productVariant.create({
              data: {
                productId: prod.id,
                size: String(v.size),
                sku: variantSku,
                colorName: 'Standard',
                costPricePaise: Number(dataToSave.costPricePaise) || 49900,
                sellingPricePaise: Number(dataToSave.pricePaise) || prod.pricePaise,
                stockCount: Number(v.stockCount) || 20,
                available: true,
                status: 'ACTIVE',
              },
            });
          }

          // Update reselling product tracking if present
          const existingReselling = await tx.resellingProduct.findFirst({ where: { productId: prod.id } });
          if (existingReselling) {
            await tx.resellingProduct.update({
              where: { id: existingReselling.id },
              data: {
                supplierUrl: cleanUrl,
                supplierCostPaise: Number(dataToSave.costPricePaise) || 49900,
                priceVerifiedAt: new Date(),
              },
            });
          }

        } else {
          // --- CREATE PATH ---
          let uniqueSlug = dataToSave.slug;
          const slugExists = await tx.product.findUnique({ where: { slug: uniqueSlug } });
          if (slugExists) {
            uniqueSlug = `${uniqueSlug}-${Math.random().toString(36).substring(2, 6)}`;
          }

          prod = await tx.product.create({
            data: {
              name: dataToSave.name,
              slug: uniqueSlug,
              description: dataToSave.description,
              shortDescription: `${dataToSave.fabric} · ${dataToSave.fit} · Always Rare`,
              gender: dataToSave.gender,
              categoryId,
              pricePaise: Number(dataToSave.pricePaise) || 189900,
              compareAtPricePaise: Number(dataToSave.compareAtPricePaise) || 399900,
              costPricePaise: Number(dataToSave.costPricePaise) || 49900,
              shippingCostPaise: 7000,
              packagingCostPaise: 3000,
              brand: 'XEVORAS',
              productType: 'Apparel',
              fabric: dataToSave.fabric,
              pattern: dataToSave.pattern,
              fit: dataToSave.fit,
              occasion: dataToSave.occasion,
              sleeveType: dataToSave.sleeveType || 'Comfort Tailored',
              neckType: dataToSave.neckType || 'Classic Elegant',
              careInstructions: dataToSave.careInstructions,
              status: 'PUBLISHED',
              featured: true,
              isNewArrival: true,
              isTrending: true,
              sourcingType: 'MEESHO',
              supplierStatus: 'VERIFIED',
              supplierSourceUrl: cleanUrl,
              supplierNotes: `Auto-imported from Meesho link: ${cleanUrl}. Product ID: ${validation.sourceProductId}`,
              supplierVerificationDate: new Date(),
            },
          });

          // Create Media
          await tx.productMedia.create({
            data: {
              productId: prod.id,
              url: coverImg,
              altText: `${prod.name} - Front View`,
              sortOrder: 0,
              isCover: true,
            },
          });

          // Create Variants safely with collision-free SKUs
          for (const v of rawVariants) {
            let variantSku = `XV-${prod.slug.slice(0, 10).toUpperCase()}-${String(v.size).toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
            const skuCollision = await tx.productVariant.findUnique({ where: { sku: variantSku } });
            if (skuCollision) {
              variantSku = `${variantSku}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            }

            await tx.productVariant.create({
              data: {
                productId: prod.id,
                size: String(v.size),
                sku: variantSku,
                colorName: 'Standard',
                costPricePaise: Number(dataToSave.costPricePaise) || 49900,
                sellingPricePaise: Number(dataToSave.pricePaise) || prod.pricePaise,
                stockCount: Number(v.stockCount) || 20,
                available: true,
                status: 'ACTIVE',
              },
            });
          }

          // Create Import Job
          await tx.productImportJob.create({
            data: {
              sourceUrl: cleanUrl,
              sourcePlatform: 'MEESHO',
              status: 'COMPLETED',
              draftProductId: prod.id,
              importNotes: `Successfully imported & published. Sourcing cost: ₹${((dataToSave.costPricePaise || 49900) / 100).toFixed(0)}, Selling price: ₹${(prod.pricePaise / 100).toFixed(0)}`,
            },
          });

          // Supplier source
          const supplierSource = await tx.supplierSource.findFirst();
          if (supplierSource) {
            await tx.resellingProduct.create({
              data: {
                productId: prod.id,
                supplierSourceId: supplierSource.id,
                supplierUrl: cleanUrl,
                supplierCostPaise: Number(dataToSave.costPricePaise) || 49900,
                estShippingCostPaise: 7000,
                estPackagingCostPaise: 3000,
                stockVerifiedAt: new Date(),
                priceVerifiedAt: new Date(),
              },
            });
          }
        }

        return prod;
      });

      // Synchronize in memory for immediate access in current container
      try {
        CatalogService.addProductToMemory({
          id: savedProduct.id,
          name: savedProduct.name,
          slug: savedProduct.slug,
          description: savedProduct.description,
          shortDescription: savedProduct.shortDescription || undefined,
          gender: savedProduct.gender as any,
          pricePaise: savedProduct.pricePaise,
          compareAtPricePaise: savedProduct.compareAtPricePaise || undefined,
          costPricePaise: savedProduct.costPricePaise || 0,
          material: savedProduct.fabric || undefined,
          fit: savedProduct.fit || undefined,
          pattern: savedProduct.pattern || undefined,
          care: savedProduct.careInstructions || undefined,
          featured: Boolean(savedProduct.featured),
          isNewArrival: Boolean(savedProduct.isNewArrival),
          isTrending: Boolean(savedProduct.isTrending),
          status: savedProduct.status,
          category: savedProduct.categoryId,
          categoryName: 'Collection',
          sourcing: 'meesho',
          supplierStatus: 'VERIFIED',
          supplierSourceUrl: cleanUrl,
          images: [{ url: coverImg, alt: savedProduct.name, isCover: true }],
          variants: [
            { sku: `XV-${savedProduct.slug.toUpperCase()}-S`, size: 'S', colorName: 'Standard', stock: 15 },
            { sku: `XV-${savedProduct.slug.toUpperCase()}-M`, size: 'M', colorName: 'Standard', stock: 25 },
            { sku: `XV-${savedProduct.slug.toUpperCase()}-L`, size: 'L', colorName: 'Standard', stock: 20 },
          ],
        });
      } catch (cacheErr) {
        // safe ignore
      }

      // Synchronize with catalogue.json for local persistence if writable
      try {
        await CatalogueSyncService.syncPrismaToCatalogueJson();
      } catch (syncErr) {
        // Ignored on read-only serverless filesystems
      }

      // Revalidate cache for instant storefront updates
      try {
        revalidatePath('/shop');
        revalidatePath('/women');
        revalidatePath('/men');
        revalidatePath(`/product/${savedProduct.slug}`);
        revalidatePath('/');
      } catch (e) {
        // dynamic routes will fetch fresh DB rows regardless
      }

      return NextResponse.json({
        success: true,
        message: existingProduct ? 'Product details updated and re-synced successfully!' : 'Product imported and published to live storefront!',
        product: savedProduct,
      });
    }

    return NextResponse.json({ error: 'Invalid action requested' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in Meesho import API:', err);
    return NextResponse.json({ error: err.message || 'Failed to process Meesho product' }, { status: 500 });
  }
}
