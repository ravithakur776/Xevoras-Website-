import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAdminSessionFromRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status'); // ALL, PUBLISHED, DRAFT, ARCHIVED
    const source = searchParams.get('source'); // ALL, OWN, MEESHO
    const stockFilter = searchParams.get('stock'); // ALL, LOW_STOCK, OUT_OF_STOCK
    const category = searchParams.get('category');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (source && source !== 'ALL') {
      if (source === 'MEESHO') {
        where.OR = [{ sourcingType: 'MEESHO' }, { sourcingType: 'ON_DEMAND' }, { supplierSourceUrl: { not: null } }];
      } else if (source === 'OWN') {
        where.sourcingType = 'OWN';
      }
    }

    if (category && category !== 'ALL') {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
        { variants: { some: { sku: { contains: search } } } },
      ];
    }

    const totalCount = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        collection: true,
        variants: true,
        media: { orderBy: { sortOrder: 'asc' } },
        resellingDetail: { include: { supplierSource: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    });

    const formatted = products.map((p) => {
      const totalStock = p.variants.reduce((sum, v) => sum + v.stockCount, 0);
      const firstSku = p.variants[0]?.sku || `XV-${p.slug.toUpperCase()}`;
      const coverImage = p.media.find((m) => m.isCover)?.url || p.media[0]?.url || '/media/products/women-1.jpg';

      // Economics calculation
      const sellingPrice = p.pricePaise;
      const supplierCost = p.costPricePaise || p.resellingDetail?.supplierCostPaise || Math.round(sellingPrice * 0.35);
      const shipping = p.shippingCostPaise || 7000;
      const packaging = p.packagingCostPaise || 3000;
      const otherExpenses = p.otherExpensesPaise || 0;
      const totalCost = supplierCost + shipping + packaging + otherExpenses;
      const contribution = sellingPrice - totalCost;
      const marginPercent = sellingPrice > 0 ? Number(((contribution / sellingPrice) * 100).toFixed(1)) : 0;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: firstSku,
        category: p.categoryId,
        categoryName: p.category?.name || 'Uncategorized',
        collectionName: p.collection?.name || null,
        gender: p.gender,
        pricePaise: p.pricePaise,
        compareAtPricePaise: p.compareAtPricePaise,
        costPricePaise: supplierCost,
        shippingCostPaise: shipping,
        packagingCostPaise: packaging,
        otherExpensesPaise: otherExpenses,
        totalCostPaise: totalCost,
        estimatedContributionPaise: contribution,
        estimatedMarginPercent: marginPercent,
        status: p.status,
        featured: p.featured,
        isNewArrival: p.isNewArrival,
        isTrending: p.isTrending,
        sourcingType: p.sourcingType,
        supplierStatus: p.supplierStatus,
        supplierSourceUrl: p.supplierSourceUrl || p.resellingDetail?.supplierUrl || null,
        supplierNotes: p.supplierNotes || p.resellingDetail?.fulfilmentNotes || null,
        supplierVerificationDate: p.supplierVerificationDate,
        totalStock,
        variantsCount: p.variants.length,
        coverImage,
        images: p.media.map((m) => ({ url: m.url, alt: m.altText, isCover: m.isCover })),
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          stock: v.stockCount,
          costPricePaise: v.costPricePaise,
          sellingPricePaise: v.sellingPricePaise,
          status: v.status,
          availabilityMode: v.availabilityMode,
        })),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    // Optional stock filtering in memory if required
    let results = formatted;
    if (stockFilter === 'LOW_STOCK') {
      results = results.filter((p) => p.totalStock > 0 && p.totalStock <= 5);
    } else if (stockFilter === 'OUT_OF_STOCK') {
      results = results.filter((p) => p.totalStock === 0);
    }

    return NextResponse.json({
      products: results,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug: userSlug,
      description,
      shortDescription,
      gender = 'women',
      pricePaise,
      compareAtPricePaise,
      costPricePaise = 0,
      shippingCostPaise = 7000,
      packagingCostPaise = 3000,
      otherExpensesPaise = 0,
      brand = 'XEVORAS',
      productType = 'Apparel',
      fabric,
      pattern,
      fit,
      occasion,
      sleeveType,
      neckType,
      careInstructions,
      keywords,
      status = 'PUBLISHED', // DRAFT, PUBLISHED
      featured = false,
      isNewArrival = true,
      isTrending = false,
      categoryId = 'women-dresses',
      collectionId,
      sourcingType: rawSourcingType,
      supplierStatus = 'VERIFIED',
      supplierSourceUrl,
      supplierNotes,
      seoTitle,
      seoDescription,
      images = [],
      variants = [],
    } = body;

    const sourcingType = (rawSourcingType || body.sourcing || 'OWN').toUpperCase();

    if (!name || !pricePaise) {
      return NextResponse.json({ error: 'Product name and selling price are required.' }, { status: 400 });
    }

    // Generate clean unique slug
    let baseSlug = (userSlug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let finalSlug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // Execute atomic product creation
    const created = await prisma.$transaction(async (tx) => {
      // 1. Create Product
      const product = await tx.product.create({
        data: {
          name,
          slug: finalSlug,
          description: description || 'Artisanal piece tailored from high-density luxury textiles.',
          shortDescription: shortDescription || null,
          gender: gender.toLowerCase(),
          pricePaise: Number(pricePaise),
          compareAtPricePaise: compareAtPricePaise ? Number(compareAtPricePaise) : null,
          costPricePaise: Number(costPricePaise) || 0,
          shippingCostPaise: Number(shippingCostPaise) || 7000,
          packagingCostPaise: Number(packagingCostPaise) || 3000,
          otherExpensesPaise: Number(otherExpensesPaise) || 0,
          brand,
          productType,
          fabric,
          material: fabric || null,
          fit,
          pattern,
          occasion,
          sleeveType,
          neckType,
          careInstructions,
          keywords,
          status: status.toUpperCase(),
          featured: Boolean(featured),
          isNewArrival: Boolean(isNewArrival),
          isTrending: Boolean(isTrending),
          categoryId,
          collectionId: collectionId || null,
          sourcingType: sourcingType.toUpperCase(),
          supplierStatus: supplierStatus.toUpperCase(),
          supplierSourceUrl: supplierSourceUrl || null,
          supplierNotes: supplierNotes || null,
          supplierVerificationDate: supplierSourceUrl ? new Date() : null,
          seoTitle: seoTitle || `${name} — XEVORAS`,
          seoDescription: seoDescription || shortDescription || description,
        },
      });

      // 2. Attach Media
      const mediaList = images.length > 0
        ? images
        : [{ url: '/media/products/women-1.jpg', isCover: true, alt: name }];

      for (let idx = 0; idx < mediaList.length; idx++) {
        const item = mediaList[idx];
        const imgUrl = typeof item === 'string' ? item : item.url;
        await tx.productMedia.create({
          data: {
            productId: product.id,
            url: imgUrl,
            altText: item.alt || name,
            sortOrder: idx,
            isCover: idx === 0 || item.isCover === true,
          },
        });
      }

      // 3. Attach Variants
      const defaultVariants = [
        { sku: `XV-${finalSlug.toUpperCase()}-S`, size: 'S', colorName: 'Noir', stockCount: 10 },
        { sku: `XV-${finalSlug.toUpperCase()}-M`, size: 'M', colorName: 'Noir', stockCount: 15 },
        { sku: `XV-${finalSlug.toUpperCase()}-L`, size: 'L', colorName: 'Noir', stockCount: 10 },
      ];

      const variantList = variants.length > 0 ? variants : defaultVariants;

      for (const v of variantList) {
        let variantSku = v.sku || `XV-${finalSlug.slice(0, 10).toUpperCase()}-${String(v.size || 'M').toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
        const existingSku = await tx.productVariant.findUnique({ where: { sku: variantSku } });
        if (existingSku) {
          variantSku = `${variantSku}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        }
        await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: variantSku,
            size: v.size || 'M',
            colorName: v.colorName || 'Noir',
            colorHex: v.colorHex || '#101010',
            stockCount: Number(v.stock !== undefined ? v.stock : v.stockCount || 10),
            costPricePaise: v.costPricePaise ? Number(v.costPricePaise) : Number(costPricePaise) || 0,
            sellingPricePaise: v.sellingPricePaise ? Number(v.sellingPricePaise) : Number(pricePaise),
            status: v.status || 'ACTIVE',
            availabilityMode: v.availabilityMode || (sourcingType === 'MEESHO' ? 'SUPPLIER_CHECK_REQUIRED' : 'OWN_VERIFIED'),
          },
        });
      }

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'PRODUCT_CREATED',
          entityType: 'Product',
          entityId: product.id,
          metadataJson: JSON.stringify({ name, slug: finalSlug, status, sourcingType }),
        },
      });

      return product;
    });

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
