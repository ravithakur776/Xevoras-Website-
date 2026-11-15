import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAdminSessionFromRequest } from '@/lib/auth/session';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id } = await params;

    const source = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, media: true },
    });

    if (!source) {
      return NextResponse.json({ error: 'Source product not found' }, { status: 404 });
    }

    // Generate unique slug
    let newSlug = `${source.slug}-copy`;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${source.slug}-copy-${counter++}`;
    }

    const duplicated = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: `${source.name} (Copy)`,
          slug: newSlug,
          description: source.description,
          shortDescription: source.shortDescription,
          gender: source.gender,
          pricePaise: source.pricePaise,
          compareAtPricePaise: source.compareAtPricePaise,
          costPricePaise: source.costPricePaise,
          shippingCostPaise: source.shippingCostPaise,
          packagingCostPaise: source.packagingCostPaise,
          otherExpensesPaise: source.otherExpensesPaise,
          brand: source.brand,
          productType: source.productType,
          fabric: source.fabric,
          material: source.material,
          fit: source.fit,
          pattern: source.pattern,
          occasion: source.occasion,
          sleeveType: source.sleeveType,
          neckType: source.neckType,
          careInstructions: source.careInstructions,
          keywords: source.keywords,
          status: 'DRAFT',
          featured: false,
          isNewArrival: false,
          isTrending: false,
          categoryId: source.categoryId,
          collectionId: source.collectionId,
          sourcingType: source.sourcingType,
          supplierStatus: source.supplierStatus,
          supplierSourceUrl: source.supplierSourceUrl,
          supplierNotes: source.supplierNotes ? `[Duplicate of ${source.name}] ${source.supplierNotes}` : null,
          seoTitle: source.seoTitle ? `${source.seoTitle} (Copy)` : null,
          seoDescription: source.seoDescription,
        },
      });

      // Clone media
      for (const m of source.media) {
        await tx.productMedia.create({
          data: {
            productId: p.id,
            url: m.url,
            altText: m.altText,
            sortOrder: m.sortOrder,
            isCover: m.isCover,
            mediaType: m.mediaType,
          },
        });
      }

      // Clone variants with new SKUs
      for (const v of source.variants) {
        const uniqueSuffix = Math.floor(100 + Math.random() * 900);
        await tx.productVariant.create({
          data: {
            productId: p.id,
            sku: `${v.sku}-CP${uniqueSuffix}`,
            size: v.size,
            colorName: v.colorName,
            colorHex: v.colorHex,
            stockCount: v.stockCount,
            costPricePaise: v.costPricePaise,
            sellingPricePaise: v.sellingPricePaise,
            status: v.status,
            availabilityMode: v.availabilityMode,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'PRODUCT_DUPLICATED',
          entityType: 'Product',
          entityId: p.id,
          metadataJson: JSON.stringify({ sourceId: id, newSlug }),
        },
      });

      return p;
    });

    return NextResponse.json({ success: true, product: duplicated }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
