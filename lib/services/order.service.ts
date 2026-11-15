import { Order, OrderStatus, SourcingStatus, CartItem, ShippingAddress, DashboardMetrics } from '../types';

let ordersStore: Order[] = [];

export class OrderService {
  public static getAllOrders(): Order[] {
    return ordersStore;
  }

  public static saveDirectOrder(order: Order): void {
    if (!ordersStore.some((o) => o.id === order.id || o.orderNumber === order.orderNumber)) {
      ordersStore = [order, ...ordersStore];
    }
  }

  public static getOrderById(id: string): Order | undefined {
    return ordersStore.find((o) => o.id === id || o.orderNumber === id);
  }

  public static getResaleOrders(): Order[] {
    return ordersStore.filter((o) => o.items.some((i) => i.sourcing === 'on_demand'));
  }

  public static createOrder(data: {
    customer: ShippingAddress;
    items: CartItem[];
    paymentMethod: 'COD' | 'PREPAID';
    discountPaise?: number;
    notes?: string;
  }): Order {
    const subtotalPaise = data.items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);
    const discountPaise = data.discountPaise || 0;
    const shippingPaise = 0; // Free delivery storewide
    const taxPaise = Math.round((subtotalPaise - discountPaise) * 0.05);
    const totalPaise = subtotalPaise - discountPaise + shippingPaise;

    const hasOnDemand = data.items.some((i) => i.sourcing === 'on_demand');
    const orderNumber = 'XV-' + Math.floor(10000 + Math.random() * 90000);
    const id = 'ord_' + Math.random().toString(36).substring(2, 9);

    const newOrder: Order = {
      id,
      orderNumber,
      createdAt: new Date().toISOString(),
      customer: data.customer,
      items: data.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        slug: i.slug,
        sku: i.sku,
        size: i.size,
        color: i.color,
        qty: i.quantity,
        pricePaise: i.pricePaise,
        imageUrl: i.imageUrl,
        sourcing: i.sourcing,
      })),
      subtotalPaise,
      discountPaise,
      shippingPaise,
      taxPaise,
      totalPaise,
      status: 'confirmed',
      sourcingStatus: hasOnDemand ? 'to_source' : 'not_applicable',
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'PREPAID' ? 'completed' : 'pending',
      notes: data.notes,
    };

    ordersStore = [newOrder, ...ordersStore];
    return newOrder;
  }

  public static updateOrderStatus(id: string, status: OrderStatus): boolean {
    const order = ordersStore.find((o) => o.id === id || o.orderNumber === id);
    if (!order) return false;
    order.status = status;
    return true;
  }

  public static updateSourcingStatus(
    id: string,
    sourcingStatus: SourcingStatus,
    supplierOrderId?: string
  ): boolean {
    const order = ordersStore.find((o) => o.id === id || o.orderNumber === id);
    if (!order) return false;
    order.sourcingStatus = sourcingStatus;
    if (supplierOrderId) order.supplierOrderId = supplierOrderId;
    return true;
  }

  public static updateShipment(id: string, trackingNumber: string, carrier: string): boolean {
    const order = ordersStore.find((o) => o.id === id || o.orderNumber === id);
    if (!order) return false;
    order.trackingNumber = trackingNumber;
    order.trackingCarrier = carrier;
    order.status = 'shipped';
    return true;
  }

  public static getDashboardMetrics(): DashboardMetrics {
    const totalRevenuePaise = ordersStore
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalPaise, 0);

    const totalOrders = ordersStore.length;
    const successfulOrders = ordersStore.filter((o) => o.status === 'delivered' || o.status === 'shipped').length;
    const pendingOrders = ordersStore.filter((o) => o.status === 'confirmed' || o.status === 'packed').length;
    const aovPaise = totalOrders > 0 ? Math.round(totalRevenuePaise / totalOrders) : 0;

    return {
      totalRevenuePaise,
      totalOrders,
      successfulOrders,
      pendingOrders,
      aovPaise,
      estimatedGrossMarginPercent: 54.2,
      lowStockCount: 3,
    };
  }
}
