import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CatalogueSyncService } from '@/lib/services/catalogueSync.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, paymentMethod, couponCode, notes } = body;

    // 1. Validate customer details
    if (
      !customer ||
      !customer.fullName ||
      !customer.email ||
      !customer.phone ||
      !customer.addressLine1 ||
      !customer.city ||
      !customer.state ||
      !customer.pincode
    ) {
      return NextResponse.json(
        { error: 'All shipping address fields are required.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your shopping bag is empty.' }, { status: 400 });
    }

    // 2. Fetch products and recalculate prices from DB (prevent price spoofing)
    const productSlugsOrIds = items.map((i: any) => i.productId || i.slug);
    const dbProducts = await prisma.product.findMany({
      where: {
        OR: [{ id: { in: productSlugsOrIds } }, { slug: { in: productSlugsOrIds } }],
      },
      include: { variants: true },
    });

    let verifiedSubtotalPaise = 0;
    const verifiedOrderItems: Array<{
      productName: string;
      slug: string;
      sku: string;
      size: string;
      color: string;
      imageUrl: string;
      quantity: number;
      unitPricePaise: number;
      totalPricePaise: number;
      sourcingType: string;
      supplierCostPaise?: number;
    }> = [];

    let hasOnDemandItems = false;

    for (const item of items) {
      const dbProd = dbProducts.find((p) => p.id === item.productId || p.slug === item.slug);
      if (!dbProd) {
        return NextResponse.json(
          { error: `Product not found or unavailable: ${item.productName || item.productId}` },
          { status: 404 }
        );
      }

      // Check variant
      const dbVariant = dbProd.variants.find((v) => v.sku === item.sku || v.size === item.size);
      const unitPrice = dbProd.pricePaise;
      const qty = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = unitPrice * qty;

      if (dbProd.sourcingType === 'ON_DEMAND') {
        hasOnDemandItems = true;
      }

      verifiedSubtotalPaise += lineTotal;
      verifiedOrderItems.push({
        productName: dbProd.name,
        slug: dbProd.slug,
        sku: dbVariant?.sku || item.sku || `XV-${dbProd.slug.toUpperCase()}-${item.size}`,
        size: dbVariant?.size || item.size || 'M',
        color: dbVariant?.colorName || item.color || 'Standard',
        imageUrl: item.imageUrl || '/media/products/women-1.jpg',
        quantity: qty,
        unitPricePaise: unitPrice,
        totalPricePaise: lineTotal,
        sourcingType: dbProd.sourcingType || 'OWN',
      });
    }

    // 3. Server-side coupon verification
    let discountPaise = 0;
    if (couponCode && typeof couponCode === 'string') {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.active) {
        if (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) {
          if (verifiedSubtotalPaise >= coupon.minOrderPaise) {
            if (coupon.discountPercent) {
              discountPaise = Math.round((verifiedSubtotalPaise * coupon.discountPercent) / 100);
            } else if (coupon.discountFlatPaise) {
              discountPaise = coupon.discountFlatPaise;
            }
            if (coupon.maxDiscountPaise && discountPaise > coupon.maxDiscountPaise) {
              discountPaise = coupon.maxDiscountPaise;
            }
          }
        }
      }
    }

    const shippingPaise = 0; // Free express delivery across India
    const taxPaise = Math.round((verifiedSubtotalPaise - discountPaise) * 0.05);
    const totalPaise = Math.max(0, verifiedSubtotalPaise - discountPaise + shippingPaise);

    const orderNumber = 'XV-' + Math.floor(10000 + Math.random() * 90000);

    // 4. Atomic Database Transaction: Save order + items + decrement stock
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          guestEmail: customer.email,
          guestPhone: customer.phone,
          shippingDetailsJson: JSON.stringify(customer),
          subtotalPaise: verifiedSubtotalPaise,
          discountPaise,
          taxPaise,
          shippingPaise,
          totalPaise,
          status: 'CONFIRMED',
          sourcingStatus: hasOnDemandItems ? 'TO_SOURCE' : 'NOT_APPLICABLE',
          paymentMethod: paymentMethod === 'PREPAID' ? 'PREPAID' : 'COD',
          paymentStatus: paymentMethod === 'PREPAID' ? 'COMPLETED' : 'PENDING',
          notes: notes || undefined,
          items: {
            create: verifiedOrderItems.map((i) => ({
              productName: i.productName,
              slug: i.slug,
              sku: i.sku,
              size: i.size,
              color: i.color,
              imageUrl: i.imageUrl,
              quantity: i.quantity,
              unitPricePaise: i.unitPricePaise,
              totalPricePaise: i.totalPricePaise,
              sourcingType: i.sourcingType,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement physical variant stock where applicable
      for (const item of verifiedOrderItems) {
        if (item.sourcingType === 'OWN') {
          await tx.productVariant.updateMany({
            where: { sku: item.sku },
            data: { stockCount: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    // Mirror order to orders.json for disk visibility & legacy sync
    CatalogueSyncService.logOrderToDisk({
      ...createdOrder,
      customer,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        createdAt: createdOrder.createdAt,
        totalPaise: createdOrder.totalPaise,
        status: createdOrder.status,
        paymentMethod: createdOrder.paymentMethod,
        customer,
        items: createdOrder.items,
      },
    });
  } catch (err: any) {
    console.error('[API /api/checkout] Error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
