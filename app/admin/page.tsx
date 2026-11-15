'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatINR } from '@/lib/utils/format';
import {
  ShoppingBag,
  Plus,
  Link2,
  DollarSign,
  Package,
  ExternalLink,
  Edit2,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Phone,
  MessageCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

interface MetricState {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  meeshoProducts: number;
  ownStockProducts: number;
  totalOrders: number;
  totalRevenuePaise: number;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  pricePaise: number;
  status: string;
  sourcingType: string;
  totalStock: number;
  coverImage?: string;
  images?: Array<{ url: string }>;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<MetricState>({
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    meeshoProducts: 0,
    ownStockProducts: 0,
    totalOrders: 0,
    totalRevenuePaise: 0,
  });
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchDashboardData = async (isBackground = false) => {
    try {
      const [metRes, prodRes, ordRes] = await Promise.all([
        fetch('/api/admin/metrics', { cache: 'no-store' }),
        fetch('/api/admin/products?limit=8', { cache: 'no-store' }),
        fetch('/api/orders', { cache: 'no-store' }),
      ]);

      if (metRes.ok) {
        const metData = await metRes.json();
        if (metData.metrics) {
          setMetrics({
            totalProducts: metData.metrics.totalProducts || 0,
            publishedProducts: metData.metrics.publishedProducts || 0,
            draftProducts: metData.metrics.draftProducts || 0,
            meeshoProducts: metData.metrics.meeshoProducts || 0,
            ownStockProducts: metData.metrics.ownStockProducts || 0,
            totalOrders: metData.metrics.totalOrders || 0,
            totalRevenuePaise: metData.metrics.totalRevenuePaise || 0,
          });
        }
      }

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }

      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData.orders || []);
      }
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // 1-Click Status Toggle
  const handleTogglePublish = async (p: ProductItem) => {
    const newStatus = p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, status: newStatus } : item))
    );

    setToastMsg(
      newStatus === 'PUBLISHED'
        ? `"${p.name}" is now LIVE on the storefront.`
        : `"${p.name}" moved to drafts (hidden from website).`
    );
    setTimeout(() => setToastMsg(null), 3000);

    try {
      await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchDashboardData();
    } catch {
      fetchDashboardData();
    }
  };

  // Immediate Real-Time Deletion
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const target = productToDelete;
    setIsDeleting(true);

    // Optimistic removal from screen
    const prevProducts = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== target.id));
    setProductToDelete(null);

    setToastMsg(`Deleted "${target.name}". Removed from live website.`);
    setTimeout(() => setToastMsg(null), 4000);

    try {
      const res = await fetch(`/api/admin/products/${target.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setProducts(prevProducts);
        const data = await res.json();
        alert(data.error || 'Could not delete product');
      } else {
        fetchDashboardData();
      }
    } catch (err: any) {
      setProducts(prevProducts);
      alert(err.message || 'Network error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout activeHref="/admin">
      <div className="space-y-8 max-w-6xl mx-auto pb-16">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#1C1C1C] border border-[#B89560] text-[#F5F1E8] text-xs rounded-lg shadow-2xl flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 size={16} className="text-[#B89560]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Clean Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B89560] font-bold">
                XEVORAS CONTROL CENTRE
              </span>
              <span className="text-[10px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                LIVE PRODUCTION
              </span>
            </div>
            <h1 className="font-editorial text-2xl md:text-3xl font-bold text-[#F5F1E8]">
              Storefront Overview
            </h1>
            <p className="text-xs text-[#B9ADA1] mt-0.5">
              Live products, active catalogue counts, and fast product management portals.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchDashboardData()}
              className="p-2 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 rounded-lg text-[#B9ADA1] hover:text-[#F5F1E8] transition-colors"
              title="Refresh real-time data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link
              href="/admin/products/new/manual"
              className="px-4 py-2 bg-[#B89560] hover:bg-[#A38250] text-[#101010] text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus size={15} />
              <span>+ Add Dress</span>
            </Link>
          </div>
        </div>

        {/* 4 Clean Minimal KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#161616] border border-white/10 space-y-1">
            <span className="text-[11px] font-semibold text-[#B9ADA1] uppercase tracking-wider block">
              Live on Store
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-3xl font-bold text-[#F5F1E8]">
                {metrics.publishedProducts}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">Active Pieces</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#161616] border border-white/10 space-y-1">
            <span className="text-[11px] font-semibold text-[#B9ADA1] uppercase tracking-wider block">
              Drafts (Hidden)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-3xl font-bold text-[#F5F1E8]">
                {metrics.draftProducts}
              </span>
              <span className="text-[11px] text-amber-400 font-medium">In Reserve</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#161616] border border-white/10 space-y-1">
            <span className="text-[11px] font-semibold text-[#B9ADA1] uppercase tracking-wider block">
              Customer Orders
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-3xl font-bold text-[#F5F1E8]">
                {metrics.totalOrders}
              </span>
              <span className="text-[11px] text-[#B9ADA1]">Total Orders</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#161616] border border-white/10 space-y-1">
            <span className="text-[11px] font-semibold text-[#B9ADA1] uppercase tracking-wider block">
              Store Revenue
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-2xl font-bold text-[#B89560]">
                {formatINR(metrics.totalRevenuePaise)}
              </span>
            </div>
          </div>
        </div>

        {/* 2 Fast Action Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Upload Own Dress */}
          <Link
            href="/admin/products/new/manual"
            className="group p-6 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#141414] border border-white/10 hover:border-[#B89560]/60 transition-all shadow-xl flex items-start justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#B89560]/10 border border-[#B89560]/20 flex items-center justify-center text-[#B89560] group-hover:scale-105 transition-transform">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#F5F1E8] group-hover:text-[#B89560] transition-colors">
                  Upload Own Dress &amp; Clothing
                </h3>
                <p className="text-xs text-[#B9ADA1] mt-1 max-w-sm">
                  Add custom designs, fabric specifications, occasion types, sizes, and photography directly to your collection.
                </p>
              </div>
            </div>
            <span className="text-[#B89560] text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-2">
              Open Studio <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Card 2: Meesho URL Import */}
          <Link
            href="/admin/products/import/meesho"
            className="group p-6 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#141414] border border-white/10 hover:border-[#B89560]/60 transition-all shadow-xl flex items-start justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#B89560] group-hover:scale-105 transition-transform">
                <Link2 size={20} />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#F5F1E8] group-hover:text-[#B89560] transition-colors">
                  ⚡ 1-Click Meesho Import
                </h3>
                <p className="text-xs text-[#B9ADA1] mt-1 max-w-sm">
                  Paste Meesho product link &rarr; auto-fill all specifications, prices &amp; images &rarr; publish directly to live storefront.
                </p>
              </div>
            </div>
            <span className="text-[#B89560] text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-2">
              Auto-Fill Now <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Live Customer Orders Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-xl font-bold text-[#F5F1E8]">
                  Live Customer Orders
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE SYNC
                </span>
              </div>
              <p className="text-xs text-[#B9ADA1] mt-0.5">
                Real-time incoming orders placed by customers on your live website.
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-[#B89560] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Open Orders Desk ({orders.length})</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#B9ADA1] space-y-1">
                <Package size={24} className="mx-auto text-stone/40" />
                <p className="font-bold text-[#F5F1E8]">No customer orders yet.</p>
                <p className="text-[11px] text-stone/60">Whenever a customer places an order on the website, it appears here in real time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#121212] text-[11px] font-semibold uppercase tracking-wider text-[#B9ADA1]">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer &amp; Contact</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.slice(0, 5).map((ord) => {
                      const custName = ord.customer?.fullName || ord.guestEmail || 'Customer';
                      const custPhone = ord.customer?.phone || ord.guestPhone || '';

                      return (
                        <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#B89560]">
                            {ord.orderNumber}
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-bold text-[#F5F1E8]">{custName}</p>
                            {custPhone && (
                              <a
                                href={`tel:${custPhone}`}
                                className="text-[11px] text-[#B9ADA1] hover:text-[#B89560] font-mono flex items-center gap-1 mt-0.5"
                              >
                                <Phone size={10} className="text-[#B89560]" />
                                <span>{custPhone}</span>
                              </a>
                            )}
                          </td>

                          <td className="py-3 px-4 text-[#F5F1E8]">
                            {ord.customer?.city || 'India'}
                          </td>

                          <td className="py-3 px-4 text-[#B9ADA1]">
                            <div className="space-y-0.5 max-w-xs truncate">
                              {ord.items.map((it, i) => (
                                <p key={i} className="text-[11px] truncate">
                                  {(it.quantity ?? it.qty ?? 1)}× {it.productName} ({it.size})
                                </p>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.paymentMethod === 'COD'
                                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                                : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                            }`}>
                              {ord.paymentMethod === 'COD' ? 'COD' : 'Prepaid'}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-bold text-[#F5F1E8]">
                            {formatINR(ord.totalPaise)}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : ord.status === 'SHIPPED'
                                ? 'bg-blue-400/20 text-blue-400'
                                : ord.status === 'CANCELLED'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-[#B89560]/20 text-[#B89560]'
                            }`}>
                              {ord.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <Link
                              href="/admin/orders"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#101010] border border-white/10 hover:border-[#B89560] text-[#B9ADA1] hover:text-[#B89560] text-[11px] font-bold transition-colors"
                            >
                              <Eye size={11} />
                              <span>View</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Live Catalogue Snapshot Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-editorial text-xl font-bold text-[#F5F1E8]">
                Recent Storefront Pieces
              </h2>
              <p className="text-xs text-[#B9ADA1]">
                Real-time inventory active on your live customer website.
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-[#B89560] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All Products ({metrics.totalProducts})</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="py-16 text-center text-xs text-[#B9ADA1]">Loading pieces...</div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#B9ADA1]">
                No products found. Start by uploading a dress or importing from Meesho.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#121212] text-[11px] font-semibold uppercase tracking-wider text-[#B9ADA1]">
                      <th className="py-3 px-4">Dress</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.slice(0, 8).map((p) => {
                      const isLive = p.status === 'PUBLISHED';
                      const img = p.coverImage || p.images?.[0]?.url || '/media/products/women-1.jpg';

                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-14 bg-[#101010] rounded overflow-hidden border border-white/10 shrink-0">
                                <img src={img} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-bold text-[#F5F1E8] font-editorial text-sm">
                                  {p.name}
                                </p>
                                <p className="text-[11px] text-[#B9ADA1]">{p.category}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-semibold text-[#F5F1E8]">
                            {formatINR(p.pricePaise)}
                          </td>

                          <td className="py-3 px-4">
                            <span className="text-[10px] font-semibold text-[#B9ADA1] uppercase px-2 py-0.5 rounded bg-white/5">
                              {p.sourcingType === 'MEESHO' ? 'Meesho' : 'Own'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(p)}
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                                isLive
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                                  : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isLive ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                              />
                              {isLive ? 'Live' : 'Draft'}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isLive && (
                                <a
                                  href={`/product/${p.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded bg-[#101010] border border-white/10 hover:border-[#B89560] text-[#B9ADA1] hover:text-[#B89560]"
                                  title="View dress on live website"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              )}
                              <Link
                                href={`/admin/products/${p.id}/edit`}
                                className="p-1.5 rounded bg-[#101010] border border-white/10 hover:border-[#B89560] text-[#B9ADA1] hover:text-[#F5F1E8]"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setProductToDelete(p)}
                                className="p-1.5 rounded bg-[#101010] border border-white/10 hover:border-rose-600 text-[#B9ADA1] hover:text-rose-400"
                                title="Delete permanently"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Clean Delete Confirmation Modal */}
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#161616] border border-rose-900/60 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#F5F1E8]">
                    Delete this dress?
                  </h3>
                  <p className="text-xs text-[#B9ADA1] mt-1 leading-relaxed">
                    Are you sure you want to delete <strong className="text-white">"{productToDelete.name}"</strong>?
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#101010] rounded-lg border border-white/5 text-[11px] text-[#B9ADA1]">
                ⚡ <strong>Real-time update:</strong> This piece will be immediately and permanently removed from both your admin panel and the live website storefront.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-xs font-semibold text-[#B9ADA1] hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-950"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
