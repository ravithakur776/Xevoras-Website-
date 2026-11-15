'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Order, OrderStatus } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils/format';
import {
  ClipboardList,
  Search,
  RefreshCw,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Phone,
  MessageCircle,
  MapPin,
  Package,
  CreditCard,
  ExternalLink,
  X,
  Bell,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const prevCountRef = useRef<number | null>(null);

  const loadOrders = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: Order[] = data.orders || [];

        // Check if new orders arrived in real-time
        if (prevCountRef.current !== null && incomingOrders.length > prevCountRef.current) {
          const newest = incomingOrders[0];
          setNewOrderAlert(`🔔 NEW ORDER: ${newest.orderNumber} placed by ${newest.customer?.fullName || 'Customer'} (${formatINR(newest.totalPaise)})`);
          setTimeout(() => setNewOrderAlert(null), 8000);
        }

        prevCountRef.current = incomingOrders.length;
        setOrders(incomingOrders);
        setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        // If modal is open, refresh selected order
        if (selectedOrder) {
          const updatedSelected = incomingOrders.find((o) => o.id === selectedOrder.id);
          if (updatedSelected) setSelectedOrder(updatedSelected);
        }
      }
    } catch (err) {
      console.error('Failed to sync orders:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Initial load + Real-Time Polling every 5 seconds
  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (!res.ok) {
        loadOrders(true);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      loadOrders(true);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      (o.customer?.fullName && o.customer.fullName.toLowerCase().includes(q)) ||
      (o.customer?.phone && o.customer.phone.includes(q)) ||
      (o.guestPhone && o.guestPhone.includes(q)) ||
      (o.customer?.city && o.customer.city.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
        {/* Real-time Order Alert Toast */}
        {newOrderAlert && (
          <div className="p-4 rounded-xl bg-gold text-obsidian font-bold text-xs flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <Bell size={16} className="animate-bounce" />
              <span>{newOrderAlert}</span>
            </div>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="px-2 py-0.5 rounded bg-obsidian/20 hover:bg-obsidian/40 text-[10px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
                REAL-TIME ORDERS DESK
              </span>
              <ClipboardList size={13} className="text-gold" />
            </div>
            <h1 className="font-editorial text-3xl font-bold text-ivory mt-1">Customer Orders &amp; Delivery Desk</h1>
            <p className="text-xs text-stone mt-1">
              Live incoming customer orders from live website. Instant shipping addresses, contact buttons, and status dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE SYNC ACTIVE · {lastSyncTime}</span>
            </div>

            <button
              type="button"
              onClick={() => loadOrders()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-charcoal border border-white/10 hover:border-gold rounded-lg text-xs text-stone hover:text-ivory transition-colors"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-xl bg-charcoal border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="relative w-full sm:w-96">
            <Search size={14} className="absolute left-3.5 top-3 text-stone/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone, order number, city..."
              className="w-full bg-obsidian border border-white/10 rounded-lg pl-9 pr-4 py-2 text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-[10px] uppercase font-bold text-stone">Filter Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-stone text-xs focus:outline-none focus:border-gold"
            >
              <option value="ALL">All Orders ({orders.length})</option>
              <option value="CONFIRMED">Confirmed / New</option>
              <option value="PACKED">Packed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl bg-charcoal border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 bg-obsidian/70 text-stone uppercase font-bold tracking-wider text-[10px]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Details &amp; Contact</th>
                  <th className="p-4">Delivery City</th>
                  <th className="p-4">Items Ordered</th>
                  <th className="p-4">Payment &amp; Total</th>
                  <th className="p-4">Dispatch Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-stone/60">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw size={18} className="animate-spin text-gold" />
                          <span>Checking for real-time customer orders...</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Package size={28} className="mx-auto text-stone/40" />
                          <p className="font-bold text-stone">No customer orders found.</p>
                          <p className="text-[11px] text-stone/40">When any customer places an order on the website, it appears here instantly.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const custName = ord.customer?.fullName || ord.guestEmail || 'Customer';
                    const custPhone = ord.customer?.phone || ord.guestPhone || '';
                    const cleanPhone = custPhone.replace(/\D/g, '');

                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        <td className="p-4">
                          <span className="font-mono font-bold text-gold text-sm block">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[10px] text-stone/50 block mt-0.5">
                            {formatDate(ord.createdAt)}
                          </span>
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-ivory text-xs">{custName}</p>
                          {custPhone && (
                            <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                              <a
                                href={`tel:${custPhone}`}
                                className="inline-flex items-center gap-1 text-[11px] text-stone hover:text-gold font-mono"
                                title="Click to Call"
                              >
                                <Phone size={11} className="text-gold" />
                                <span>{custPhone}</span>
                              </a>
                              <a
                                href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(custName)},%20this%20is%20XEVORAS%20regarding%20your%20order%20${ord.orderNumber}.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                title="WhatsApp Customer"
                              >
                                <MessageCircle size={11} />
                              </a>
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1 text-stone">
                            <MapPin size={12} className="text-gold shrink-0" />
                            <span className="font-medium text-ivory">
                              {ord.customer?.city || 'India'}
                            </span>
                          </div>
                          {ord.customer?.pincode && (
                            <span className="text-[10px] text-stone/60 font-mono block pl-4">
                              PIN: {ord.customer.pincode}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="space-y-1 max-w-xs">
                            {ord.items.map((item, i) => (
                              <p key={i} className="text-stone text-[11px] truncate">
                                <strong className="text-ivory font-mono">{(item.quantity ?? item.qty ?? 1)}×</strong> {item.productName} ({item.size})
                              </p>
                            ))}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-ivory text-sm block">
                            {formatINR(ord.totalPaise)}
                          </span>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-1 ${
                            ord.paymentMethod === 'COD'
                              ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                              : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/30'
                          }`}>
                            {ord.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Prepaid Online'}
                          </span>
                        </td>

                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                            className={`rounded px-2.5 py-1 text-[11px] font-bold border focus:outline-none transition-colors ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                                : ord.status === 'SHIPPED'
                                ? 'bg-blue-400/15 text-blue-400 border-blue-400/40'
                                : ord.status === 'PACKED'
                                ? 'bg-purple-400/15 text-purple-400 border-purple-400/40'
                                : ord.status === 'CANCELLED'
                                ? 'bg-red-500/15 text-red-400 border-red-500/40'
                                : 'bg-gold/15 text-gold border-gold/40'
                            }`}
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PACKED">PACKED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-obsidian border border-white/10 hover:border-gold text-stone hover:text-gold text-[11px] font-bold transition-colors"
                          >
                            <Eye size={12} />
                            <span>View Address</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Shipping & Order Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-charcoal border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gold text-lg">
                      {selectedOrder.orderNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedOrder.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : selectedOrder.status === 'SHIPPED'
                        ? 'bg-blue-400/20 text-blue-400'
                        : 'bg-gold/20 text-gold'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone mt-0.5">
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg bg-obsidian text-stone hover:text-ivory border border-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Customer & Shipping Details */}
              <div className="p-4 rounded-xl bg-obsidian border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-stone tracking-wider">
                    Customer Information &amp; Delivery Address
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedOrder.customer?.phone && (
                      <>
                        <a
                          href={`tel:${selectedOrder.customer.phone}`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-gold text-obsidian text-xs font-bold"
                        >
                          <Phone size={11} />
                          <span>Call</span>
                        </a>
                        <a
                          href={`https://wa.me/91${selectedOrder.customer.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(selectedOrder.customer.fullName || 'Customer')},%20this%20is%20XEVORAS%20regarding%20your%20order%20${selectedOrder.orderNumber}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500 text-obsidian text-xs font-bold"
                        >
                          <MessageCircle size={11} />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <p className="text-[10px] text-stone uppercase font-bold">Full Name:</p>
                    <p className="font-bold text-ivory text-sm mt-0.5">
                      {selectedOrder.customer?.fullName || selectedOrder.guestEmail || 'Guest Client'}
                    </p>
                    <p className="text-stone mt-1">{selectedOrder.customer?.email || selectedOrder.guestEmail}</p>
                    <p className="text-stone font-mono">{selectedOrder.customer?.phone || selectedOrder.guestPhone}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-stone uppercase font-bold">Shipping Address:</p>
                    <p className="text-ivory mt-0.5 leading-relaxed">
                      {selectedOrder.customer?.addressLine1 || 'N/A'}<br />
                      {selectedOrder.customer?.addressLine2 && <>{selectedOrder.customer.addressLine2}<br /></>}
                      <strong className="text-ivory">{selectedOrder.customer?.city}</strong>, {selectedOrder.customer?.state} - <strong className="text-gold font-mono">{selectedOrder.customer?.pincode}</strong><br />
                      India
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Ordered Breakdown */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-stone tracking-wider">
                  Ordered Items ({selectedOrder.items.length})
                </span>

                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-obsidian border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-charcoal border border-white/10 shrink-0">
                          <Image
                            src={item.imageUrl || '/media/products/women-1.jpg'}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-ivory">{item.productName}</p>
                          <p className="text-stone text-[11px] font-mono mt-0.5">
                            Size: <strong className="text-gold">{item.size}</strong> · Qty: {item.quantity ?? item.qty ?? 1} · SKU: {item.sku}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-ivory font-mono">
                          {formatINR(item.totalPricePaise || ((item.unitPricePaise || 0) * (item.quantity ?? item.qty ?? 1)))}
                        </p>
                        <p className="text-[10px] text-stone">
                          ({formatINR(item.unitPricePaise || 0)} each)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-xl bg-obsidian border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone">Payment Method:</span>
                  <p className="font-bold text-ivory text-sm mt-0.5">
                    {selectedOrder.paymentMethod === 'COD' ? '💵 Cash on Delivery (COD)' : '💳 Prepaid Online'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone">Total to Collect:</span>
                  <p className="font-bold text-gold text-lg font-mono">
                    {formatINR(selectedOrder.totalPaise)}
                  </p>
                </div>
              </div>

              {/* Dispatch Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-stone">Update Order Status:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PACKED')}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 text-xs font-bold"
                  >
                    Mark Packed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 text-xs font-bold"
                  >
                    Mark Shipped
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold"
                  >
                    Mark Delivered
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 text-xs font-bold"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
