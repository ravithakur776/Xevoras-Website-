import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAdminSessionFromRequest } from '@/lib/auth/session';
import { CatalogueSyncService } from '@/lib/services/catalogueSync.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        collection: true,
        variants: true,
        media: { orderBy: { sortOrder: 'asc' } },
        resellingDetail: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, media: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update basic product fields if provided
      const productUpdateData: any = {};
      if (body.name !== undefined) productUpdateData.name = body.name;
      if (body.slug !== undefined) productUpdateData.slug = body.slug;
      if (body.description !== undefined) productUpdateData.description = body.description;
      if (body.shortDescription !== undefined) productUpdateData.shortDescription = body.shortDescription;
      if (body.gender !== undefined) productUpdateData.gender = body.gender.toLowerCase();
      if (body.pricePaise !== undefined) productUpdateData.pricePaise = Number(body.pricePaise);
      if (body.compareAtPricePaise !== undefined) productUpdateData.compareAtPricePaise = body.compareAtPricePaise ? Number(body.compareAtPricePaise) : null;
      if (body.costPricePaise !== undefined) productUpdateData.costPricePaise = Number(body.costPricePaise);
      if (body.shippingCostPaise !== undefined) productUpdateData.shippingCostPaise = Number(body.shippingCostPaise);
      if (body.packagingCostPaise !== undefined) productUpdateData.packagingCostPaise = Number(body.packagingCostPaise);
      if (body.otherExpensesPaise !== undefined) productUpdateData.otherExpensesPaise = Number(body.otherExpensesPaise);
      if (body.brand !== undefined) productUpdateData.brand = body.brand;
      if (body.productType !== undefined) productUpdateData.productType = body.productType;
      if (body.fabric !== undefined) {
        productUpdateData.fabric = body.fabric;
        productUpdateData.material = body.fabric;
      }
      if (body.fit !== undefined) productUpdateData.fit = body.fit;
      if (body.pattern !== undefined) productUpdateData.pattern = body.pattern;
      if (body.occasion !== undefined) productUpdateData.occasion = body.occasion;
      if (body.sleeveType !== undefined) productUpdateData.sleeveType = body.sleeveType;
      if (body.neckType !== undefined) productUpdateData.neckType = body.neckType;
      if (body.careInstructions !== undefined) productUpdateData.careInstructions = body.careInstructions;
      if (body.keywords !== undefined) productUpdateData.keywords = body.keywords;
      if (body.status !== undefined) productUpdateData.status = body.status.toUpperCase();
      if (body.featured !== undefined) productUpdateData.featured = Boolean(body.featured);
      if (body.isNewArrival !== undefined) productUpdateData.isNewArrival = Boolean(body.isNewArrival);
      if (body.isTrending !== undefined) productUpdateData.isTrending = Boolean(body.isTrending);
      if (body.categoryId !== undefined) productUpdateData.categoryId = body.categoryId;
      if (body.collectionId !== undefined) productUpdateData.collectionId = body.collectionId || null;
      if (body.sourcingType !== undefined) productUpdateData.sourcingType = body.sourcingType.toUpperCase();
      if (body.supplierStatus !== undefined) productUpdateData.supplierStatus = body.supplierStatus.toUpperCase();
      if (body.supplierSourceUrl !== undefined) productUpdateData.supplierSourceUrl = body.supplierSourceUrl;
      if (body.supplierNotes !== undefined) productUpdateData.supplierNotes = body.supplierNotes;
      if (body.seoTitle !== undefined) productUpdateData.seoTitle = body.seoTitle;
      if (body.seoDescription !== undefined) productUpdateData.seoDescription = body.seoDescription;

      const p = await tx.product.update({
        where: { id },
        data: productUpdateData,
      });

      // 2. Update Media if provided
      if (Array.isArray(body.images)) {
        await tx.productMedia.deleteMany({ where: { productId: id } });
        for (let idx = 0; idx < body.images.length; idx++) {
          const item = body.images[idx];
          const imgUrl = typeof item === 'string' ? item : item.url;
          await tx.productMedia.create({
            data: {
              productId: id,
              url: imgUrl,
              altText: item.alt || p.name,
              sortOrder: idx,
              isCover: idx === 0 || item.isCover === true,
            },
          });
        }
      }

      // 3. Update Variants if provided
      if (Array.isArray(body.variants)) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        for (const v of body.variants) {
          const variantSku = v.sku || `XV-${p.slug.toUpperCase()}-${v.size}-${Math.floor(100 + Math.random() * 900)}`;
          await tx.productVariant.create({
            data: {
              productId: id,
              sku: variantSku,
              size: v.size || 'M',
              colorName: v.colorName || 'Noir',
              colorHex: v.colorHex || '#101010',
              stockCount: Number(v.stock !== undefined ? v.stock : v.stockCount || 0),
              costPricePaise: v.costPricePaise ? Number(v.costPricePaise) : p.costPricePaise || 0,
              sellingPricePaise: v.sellingPricePaise ? Number(v.sellingPricePaise) : p.pricePaise,
              status: v.status || 'ACTIVE',
              availabilityMode: v.availabilityMode || (p.sourcingType === 'MEESHO' ? 'SUPPLIER_CHECK_REQUIRED' : 'OWN_VERIFIED'),
            },
          });
        }
      }

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'PRODUCT_UPDATED',
          entityType: 'Product',
          entityId: id,
          metadataJson: JSON.stringify({ changes: Object.keys(productUpdateData) }),
        },
      });

      return p;
    });

    // Real-time synchronization with catalogue.json
    await CatalogueSyncService.syncPrismaToCatalogueJson();

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, media: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Atomic guaranteed permanent deletion
    await prisma.$transaction(async (tx) => {
      // 1. Delete associated child variants
      await tx.productVariant.deleteMany({ where: { productId: id } });

      // 2. Delete associated media
      await tx.productMedia.deleteMany({ where: { productId: id } });

      // 3. Delete any supplier / reselling detail
      try {
        await tx.resellingProduct.deleteMany({ where: { productId: id } });
      } catch (e) {}

      // 4. Delete reviews
      try {
        await tx.review.deleteMany({ where: { productId: id } });
      } catch (e) {}

      // 5. Delete product
      await tx.product.delete({ where: { id } });

      // 6. Log audit event
      await tx.auditLog.create({
        data: {
          action: 'PRODUCT_PERMANENTLY_DELETED',
          entityType: 'Product',
          entityId: id,
          metadataJson: JSON.stringify({ name: existing.name, slug: existing.slug }),
        },
      });
    });

    // Real-time synchronization with catalogue.json
    await CatalogueSyncService.syncPrismaToCatalogueJson();

    return NextResponse.json({
      success: true,
      deletedId: id,
      message: `"${existing.name}" has been permanently deleted from the database and live storefront.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
