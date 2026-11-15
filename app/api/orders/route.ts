import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAdminSessionFromRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // If client is tracking an order without admin session
    if (!session) {
      if (orderNumber && (email || phone)) {
        const order = await prisma.order.findFirst({
          where: {
            orderNumber: orderNumber.trim(),
            OR: [
              { guestEmail: email ? email.trim() : undefined },
              { guestPhone: phone ? phone.trim() : undefined },
            ],
          },
          include: { items: true, shipments: true },
        });

        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const customer = order.shippingDetailsJson
          ? JSON.parse(order.shippingDetailsJson)
          : null;

        return NextResponse.json({
          orders: [
            {
              id: order.id,
              orderNumber: order.orderNumber,
              createdAt: order.createdAt,
              status: order.status,
              totalPaise: order.totalPaise,
              trackingNumber: order.trackingNumber,
              trackingCarrier: order.trackingCarrier,
              customer,
              items: order.items,
            },
          ],
        });
      }

      // Guest access without search credentials: return most recent session orders or 401
      // For seamless customer account experience, return orders matching guest email or empty
      if (email) {
        const orders = await prisma.order.findMany({
          where: { guestEmail: email.trim() },
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ orders });
      }

      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Authenticated Admin Request
    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    if (search && search.trim()) {
      whereClause.OR = [
        { orderNumber: { contains: search.trim() } },
        { guestEmail: { contains: search.trim() } },
        { guestPhone: { contains: search.trim() } },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: { items: true, shipments: true },
      orderBy: { createdAt: 'desc' },
    });

    const parsedOrders = orders.map((o) => ({
      ...o,
      customer: o.shippingDetailsJson ? JSON.parse(o.shippingDetailsJson) : { fullName: 'Guest Client' },
    }));

    return NextResponse.json({ orders: parsedOrders });
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
    const { id, status, sourcingStatus, trackingNumber, trackingCarrier, supplierOrderId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: status ? status.toUpperCase() : undefined,
        sourcingStatus: sourcingStatus ? sourcingStatus.toUpperCase() : undefined,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
        trackingCarrier: trackingCarrier !== undefined ? trackingCarrier : undefined,
        supplierOrderId: supplierOrderId !== undefined ? supplierOrderId : undefined,
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
