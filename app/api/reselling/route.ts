import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAdminSessionFromRequest } from '@/lib/auth/session';
import { MarginService } from '@/lib/services/margin.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const supplierProducts = await prisma.resellingProduct.findMany({
      include: {
        product: {
          include: { variants: true, media: true },
        },
        supplierSource: true,
      },
      orderBy: { product: { createdAt: 'desc' } },
    });

    const resaleOrders = await prisma.order.findMany({
      where: { sourcingStatus: { not: 'NOT_APPLICABLE' } },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const parsedOrders = resaleOrders.map((o) => ({
      ...o,
      customer: o.shippingDetailsJson ? JSON.parse(o.shippingDetailsJson) : { fullName: 'Client' },
    }));

    return NextResponse.json({
      supplierProducts: supplierProducts.map((sp) => ({
        id: sp.id,
        productId: sp.productId,
        name: sp.product.name,
        supplierName: sp.supplierSource.name,
        supplierSku: sp.supplierSku || 'N/A',
        supplierUrl: sp.supplierUrl || '',
        supplierCostPaise: sp.supplierCostPaise,
        sellingPricePaise: sp.product.pricePaise,
        shippingExpensePaise: sp.estShippingCostPaise,
        packagingExpensePaise: sp.estPackagingCostPaise,
        stockStatus: 'available',
        verifiedAt: sp.stockVerifiedAt || sp.product.createdAt,
        variants: sp.product.variants,
      })),
      resaleOrders: parsedOrders,
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
    const { name, supplierName, supplierSku, supplierCostPaise, sellingPricePaise, supplierUrl, categoryId } = body;

    if (!name || !supplierSku || !supplierCostPaise || !sellingPricePaise) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Duplicate SKU check in DB
    const existingSku = await prisma.resellingProduct.findFirst({
      where: { supplierSku: supplierSku.trim() },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: `Duplicate SKU: ${supplierSku} already exists in the reselling index.` },
        { status: 409 }
      );
    }

    // Find or create supplier source
    let source = await prisma.supplierSource.findFirst({
      where: { name: supplierName.trim() },
    });
    if (!source) {
      source = await prisma.supplierSource.create({
        data: { name: supplierName.trim() },
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(100 + Math.random() * 900);

    // Create product & reselling detail
    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description: `Artisan supplier-sourced piece via ${supplierName}.`,
        gender: 'women',
        pricePaise: Number(sellingPricePaise),
        categoryId: categoryId || 'women-co-ords',
        sourcingType: 'ON_DEMAND',
        featured: false,
        variants: {
          create: [
            { sku: `${supplierSku}-S`, size: 'S', colorName: 'Standard', stockCount: 99 },
            { sku: `${supplierSku}-M`, size: 'M', colorName: 'Standard', stockCount: 99 },
            { sku: `${supplierSku}-L`, size: 'L', colorName: 'Standard', stockCount: 99 },
          ],
        },
        media: {
          create: [{ url: '/media/products/women-5.jpg', isCover: true }],
        },
        resellingDetail: {
          create: {
            supplierSourceId: source.id,
            supplierSku: supplierSku.trim(),
            supplierUrl: supplierUrl || 'https://meesho.com',
            supplierCostPaise: Number(supplierCostPaise),
            estShippingCostPaise: 7000,
            estPackagingCostPaise: 3000,
            stockVerifiedAt: new Date(),
          },
        },
      },
      include: { resellingDetail: true },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
