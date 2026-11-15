import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth/session';
import { MeeshoAdapter } from '@/lib/adapters/meesho.adapter';
import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { CatalogueSyncService } from '@/lib/services/catalogueSync.service';
import { CatalogService } from '@/lib/services/catalog.service';

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

    // 1. AUTOFILL ACTION
    if (action === 'autofill') {
      const generated = MeeshoAdapter.parseAndGenerateProduct(
        validation.cleanUrl,
        customImageUrl,
        customCostPaise,
        customPricePaise
      );

      return NextResponse.json({
        success: true,
        autoFilled: generated,
      });
    }

    // 2. PUBLISH ACTION (1-Click Publish to Database & Live Storefront)
    if (action === 'publish' || action === 'instant_publish') {
      // If productData was passed from frontend form use it, else generate fresh from URL
      const dataToSave = productData?.name
        ? productData
        : MeeshoAdapter.parseAndGenerateProduct(
            validation.cleanUrl,
            customImageUrl,
            customCostPaise,
            customPricePaise
          );

      // Verify category exists in DB (fallback to women-dresses if not found)
      let categoryId = dataToSave.categoryId;
      const catExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!catExists) {
        const fallbackCat = await prisma.category.findFirst({ where: { gender: dataToSave.gender } });
        categoryId = fallbackCat ? fallbackCat.id : 'women-dresses';
      }

      // Check for slug collision; if exists, append random suffix
      let uniqueSlug = dataToSave.slug;
      const existingProduct = await prisma.product.findUnique({ where: { slug: uniqueSlug } });
      if (existingProduct) {
        uniqueSlug = `${uniqueSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }

      // Execute Atomic Database Transaction
      const createdProduct = await prisma.$transaction(async (tx) => {
        // 1. Create Product
        const prod = await tx.product.create({
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
            supplierSourceUrl: validation.cleanUrl,
            supplierNotes: `Auto-imported from Meesho link: ${validation.cleanUrl}. Product ID: ${validation.sourceProductId}`,
            supplierVerificationDate: new Date(),
          },
        });

        // 2. Create Media Images
        const coverImg = dataToSave.coverImage || '/media/products/women-1.jpg';
        await tx.productMedia.create({
          data: {
            productId: prod.id,
            url: coverImg,
            altText: `${prod.name} - Front View`,
            sortOrder: 0,
            isCover: true,
          },
        });

        // Additional gallery images if any
        if (Array.isArray(dataToSave.galleryImages)) {
          for (let i = 0; i < dataToSave.galleryImages.length; i++) {
            const imgUrl = dataToSave.galleryImages[i];
            if (imgUrl && imgUrl !== coverImg) {
              await tx.productMedia.create({
                data: {
                  productId: prod.id,
                  url: imgUrl,
                  altText: `${prod.name} - View ${i + 1}`,
                  sortOrder: i + 1,
                  isCover: false,
                },
              });
            }
          }
        }

        // 3. Create Variants (S, M, L, XL, XXL)
        const variantsList = Array.isArray(dataToSave.variants) && dataToSave.variants.length > 0
          ? dataToSave.variants
          : [
              { size: 'S', sku: `XV-MEE-${validation.sourceProductId}-S`, stockCount: 15, pricePaise: prod.pricePaise },
              { size: 'M', sku: `XV-MEE-${validation.sourceProductId}-M`, stockCount: 25, pricePaise: prod.pricePaise },
              { size: 'L', sku: `XV-MEE-${validation.sourceProductId}-L`, stockCount: 30, pricePaise: prod.pricePaise },
              { size: 'XL', sku: `XV-MEE-${validation.sourceProductId}-XL`, stockCount: 20, pricePaise: prod.pricePaise },
              { size: 'XXL', sku: `XV-MEE-${validation.sourceProductId}-XXL`, stockCount: 10, pricePaise: prod.pricePaise },
            ];

        for (const v of variantsList) {
          await tx.productVariant.create({
            data: {
              productId: prod.id,
              size: v.size,
              sku: v.sku || `XV-MEE-${prod.id.slice(-5)}-${v.size}`,
              colorName: 'Standard',
              costPricePaise: Number(dataToSave.costPricePaise) || 49900,
              sellingPricePaise: Number(dataToSave.pricePaise) || prod.pricePaise,
              stockCount: Number(v.stockCount) || 20,
              available: true,
              status: 'ACTIVE',
            },
          });
        }

        // 4. Create ProductImportJob
        await tx.productImportJob.create({
          data: {
            sourceUrl: validation.cleanUrl || targetUrl,
            sourcePlatform: 'MEESHO',
            status: 'COMPLETED',
            draftProductId: prod.id,
            importNotes: `Successfully auto-imported & published to live storefront. Sourcing cost: ₹${((dataToSave.costPricePaise || 49900) / 100).toFixed(0)}, Selling price: ₹${(prod.pricePaise / 100).toFixed(0)}`,
          },
        });

        // 5. Create ResellingProduct entry for supplier fulfillment tracking
        const supplierSource = await tx.supplierSource.findFirst();
        if (supplierSource) {
          await tx.resellingProduct.create({
            data: {
              productId: prod.id,
              supplierSourceId: supplierSource.id,
              supplierUrl: validation.cleanUrl || targetUrl,
              supplierCostPaise: Number(dataToSave.costPricePaise) || 49900,
              estShippingCostPaise: 7000,
              estPackagingCostPaise: 3000,
              stockVerifiedAt: new Date(),
              priceVerifiedAt: new Date(),
            },
          });
        }

        return prod;
      });

      // Cache in memory for immediate access in current container
      try {
        CatalogService.addProductToMemory({
          id: createdProduct.id,
          name: createdProduct.name,
          slug: createdProduct.slug,
          description: createdProduct.description,
          shortDescription: createdProduct.shortDescription || undefined,
          gender: createdProduct.gender as any,
          pricePaise: createdProduct.pricePaise,
          compareAtPricePaise: createdProduct.compareAtPricePaise || undefined,
          costPricePaise: createdProduct.costPricePaise || 0,
          material: createdProduct.fabric || undefined,
          fit: createdProduct.fit || undefined,
          pattern: createdProduct.pattern || undefined,
          care: createdProduct.careInstructions || undefined,
          featured: Boolean(createdProduct.featured),
          isNewArrival: Boolean(createdProduct.isNewArrival),
          isTrending: Boolean(createdProduct.isTrending),
          status: createdProduct.status,
          category: createdProduct.categoryId,
          categoryName: 'Collection',
          sourcing: 'meesho',
          supplierStatus: 'VERIFIED',
          supplierSourceUrl: validation.cleanUrl,
          images: [{ url: dataToSave.coverImage || '/media/products/women-1.jpg', alt: createdProduct.name, isCover: true }],
          variants: [
            { sku: `XV-${createdProduct.slug.toUpperCase()}-S`, size: 'S', colorName: 'Standard', stock: 15 },
            { sku: `XV-${createdProduct.slug.toUpperCase()}-M`, size: 'M', colorName: 'Standard', stock: 25 },
            { sku: `XV-${createdProduct.slug.toUpperCase()}-L`, size: 'L', colorName: 'Standard', stock: 20 },
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
        revalidatePath(`/product/${uniqueSlug}`);
        revalidatePath('/');
      } catch (e) {
        // dynamic routes will fetch fresh DB rows regardless
      }

      return NextResponse.json({
        success: true,
        message: 'Product successfully auto-filled, stored in backend, and published to live website!',
        product: {
          id: createdProduct.id,
          name: createdProduct.name,
          slug: createdProduct.slug,
          pricePaise: createdProduct.pricePaise,
          liveUrl: `/product/${createdProduct.slug}`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (err: any) {
    console.error('[API /api/admin/products/import/meesho] Error:', err);
    return NextResponse.json({ error: err.message || 'Import failed.' }, { status: 500 });
  }
}
