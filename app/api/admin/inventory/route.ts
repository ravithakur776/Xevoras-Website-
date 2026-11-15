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
    const supplierStatus = searchParams.get('supplierStatus');
    const source = searchParams.get('source');

    const where: any = {};
    if (supplierStatus && supplierStatus !== 'ALL') {
      where.supplierStatus = supplierStatus;
    }
    if (source && source !== 'ALL') {
      if (source === 'MEESHO') {
        where.OR = [{ sourcingType: 'MEESHO' }, { sourcingType: 'ON_DEMAND' }, { supplierSourceUrl: { not: null } }];
      } else if (source === 'OWN') {
        where.sourcingType = 'OWN';
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
        media: { where: { isCover: true }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = products.map((p) => {
      const totalStock = p.variants.reduce((sum, v) => sum + v.stockCount, 0);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category?.name || p.categoryId,
        coverImage: p.media[0]?.url || '/media/products/women-1.jpg',
        sourcingType: p.sourcingType,
        supplierStatus: p.supplierStatus,
        supplierSourceUrl: p.supplierSourceUrl,
        supplierNotes: p.supplierNotes,
        supplierVerificationDate: p.supplierVerificationDate,
        totalStock,
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          colorName: v.colorName,
          stockCount: v.stockCount,
          costPricePaise: v.costPricePaise,
          status: v.status,
          availabilityMode: v.availabilityMode,
        })),
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ inventory: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, variantId, stockCount, supplierStatus, supplierNotes } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update variant stock if variantId is provided
      if (variantId && stockCount !== undefined) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: { stockCount: Number(stockCount) },
        });
      }

      // 2. Update product supplier status & notes
      const productUpdate: any = {};
      if (supplierStatus) {
        productUpdate.supplierStatus = supplierStatus.toUpperCase();
        productUpdate.supplierVerificationDate = new Date();
      }
      if (supplierNotes !== undefined) {
        productUpdate.supplierNotes = supplierNotes;
      }

      if (Object.keys(productUpdate).length > 0) {
        await tx.product.update({
          where: { id: productId },
          data: productUpdate,
        });
      }

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'INVENTORY_UPDATED',
          entityType: 'Product',
          entityId: productId,
          metadataJson: JSON.stringify({ variantId, stockCount, supplierStatus }),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
