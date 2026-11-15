import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAdminSessionFromRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    // 1. Order KPIs
    const allOrders = await prisma.order.findMany({
      include: { items: true },
    });

    const nonCancelledOrders = allOrders.filter((o) => o.status !== 'CANCELLED');
    const totalRevenuePaise = nonCancelledOrders.reduce((sum, o) => sum + o.totalPaise, 0);
    const totalOrders = allOrders.length;
    const successfulOrders = allOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'SHIPPED').length;
    const pendingOrders = allOrders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PACKED').length;
    const aovPaise = totalOrders > 0 ? Math.round(totalRevenuePaise / totalOrders) : 0;

    // 2. Product Matrix KPIs
    const [
      totalProducts,
      publishedProducts,
      draftProducts,
      meeshoProducts,
      ownStockProducts,
      pendingSupplierVerification,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.product.count({ where: { status: 'DRAFT' } }),
      prisma.product.count({
        where: {
          OR: [
            { sourcingType: 'MEESHO' },
            { sourcingType: 'ON_DEMAND' },
            { supplierSourceUrl: { not: null } },
          ],
        },
      }),
      prisma.product.count({ where: { sourcingType: 'OWN' } }),
      prisma.product.count({
        where: {
          supplierStatus: { in: ['NOT_VERIFIED', 'VERIFICATION_PENDING'] },
        },
      }),
    ]);

    // Out of stock calculation: products where every variant has stockCount == 0
    const productsWithVariants = await prisma.product.findMany({
      select: {
        id: true,
        variants: { select: { stockCount: true } },
      },
    });

    const outOfStockProducts = productsWithVariants.filter(
      (p) => p.variants.length > 0 && p.variants.every((v) => v.stockCount === 0)
    ).length;

    // Real Low Stock calculation from DB (stock <= 3)
    const lowStockVariants = await prisma.productVariant.count({
      where: {
        stockCount: { lte: 3 },
      },
    });

    // 3. Blended Gross Margin
    let totalSellingPaise = 0;
    let totalCostEstimatePaise = 0;

    for (const ord of nonCancelledOrders) {
      for (const item of ord.items) {
        totalSellingPaise += item.totalPricePaise;
        if (item.sourcingType === 'ON_DEMAND' || item.sourcingType === 'MEESHO') {
          totalCostEstimatePaise += (item.supplierCostPaise || Math.round(item.unitPricePaise * 0.4)) * item.quantity + 10000;
        } else {
          totalCostEstimatePaise += Math.round(item.unitPricePaise * 0.35) * item.quantity;
        }
      }
    }

    const estimatedGrossMarginPercent = totalSellingPaise > 0
      ? Number((((totalSellingPaise - totalCostEstimatePaise) / totalSellingPaise) * 100).toFixed(1))
      : 58.4;

    // 4. Recent Product Activity
    const recentProducts = await prisma.product.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        sourcingType: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    const recentActivity = recentProducts.map((p) => {
      const isNew = Math.abs(p.updatedAt.getTime() - p.createdAt.getTime()) < 5000;
      return {
        id: p.id,
        type: isNew ? 'product_created' : 'product_updated',
        title: `${p.name} ${isNew ? 'created' : 'updated'} (${p.status})`,
        timestamp: p.updatedAt.toISOString(),
        badge: p.sourcingType === 'MEESHO' ? 'Meesho Sourced' : 'Own Stock',
      };
    });

    return NextResponse.json({
      metrics: {
        totalRevenuePaise,
        totalOrders,
        successfulOrders,
        pendingOrders,
        aovPaise,
        estimatedGrossMarginPercent,
        lowStockCount: lowStockVariants,
        // Product Management Overview figures
        totalProducts,
        publishedProducts,
        draftProducts,
        meeshoProducts,
        ownStockProducts,
        outOfStockProducts,
        pendingSupplierVerification,
        recentActivity,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
