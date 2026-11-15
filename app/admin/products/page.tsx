'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatINR } from '@/lib/utils/format';
import {
  ShoppingBag,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Link2,
  X,
} from 'lucide-react';

interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  categoryName: string;
  gender: string;
  pricePaise: number;
  compareAtPricePaise?: number;
  costPricePaise: number;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  sourcingType: 'OWN' | 'MEESHO' | 'ON_DEMAND';
  supplierStatus: string;
  totalStock: number;
  coverImage: string;
  updatedAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [productToDelete, setProductToDelete] = useState<AdminProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load products directly from API
  const loadProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // 1-Click Status Toggle (Live on Store / Draft)
  const handleTogglePublish = async (p: AdminProductItem) => {
    const newStatus = p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    // Optimistic local update
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, status: newStatus } : item))
    );

    setToastMsg(
      newStatus === 'PUBLISHED'
        ? `"${p.name}" is now LIVE on the website.`
        : `"${p.name}" moved to drafts (hidden from website).`
    );
    setTimeout(() => setToastMsg(null), 3000);

    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Rollback
        loadProducts();
      }
    } catch {
      loadProducts();
    }
  };

  // Immediate Real-Time Deletion
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const target = productToDelete;
    setIsDeleting(true);

    // 1. Optimistic removal: instantly disappears from the admin screen
    const previousProducts = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== target.id));
    setProductToDelete(null);

    setToastMsg(`Deleted "${target.name}". Removed from live website.`);
    setTimeout(() => setToastMsg(null), 4000);

    // 2. Perform permanent database deletion
    try {
      const res = await fetch(`/api/admin/products/${target.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        // Rollback on server failure
        const data = await res.json();
        setProducts(previousProducts);
        alert(data.error || 'Could not delete product');
      } else {
        // Fresh re-sync
        loadProducts();
      }
    } catch (err: any) {
      setProducts(previousProducts);
      alert(err.message || 'Error connecting to server');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter products by category locally
  const displayedProducts = products.filter((p) => {
    if (categoryFilter === 'ALL') return true;
    return p.category === categoryFilter;
  });

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  const liveCount = products.filter((p) => p.status === 'PUBLISHED').length;
  const draftCount = products.filter((p) => p.status === 'DRAFT').length;

  return (
    <AdminLayout activeHref="/admin/products">
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#1C1C1C] border border-[#B89560] text-[#F5F1E8] text-xs rounded-lg shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={16} className="text-[#B89560]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Clean Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B89560] font-bold">
                STORE CATALOGUE
              </span>
              <span className="text-[10px] bg-[#B89560]/10 text-[#B89560] px-2 py-0.5 rounded border border-[#B89560]/20 font-mono">
                {liveCount} LIVE ON WEBSITE
              </span>
            </div>
            <h1 className="font-editorial text-2xl md:text-3xl font-bold text-[#F5F1E8]">
              Dresses &amp; Clothing Products
            </h1>
            <p className="text-xs text-[#B9ADA1] mt-0.5">
              Add new apparel, manage prices, and publish or delete pieces directly from your live store.
            </p>
          </div>

          {/* Minimal Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/products/import/meesho"
              className="px-4 py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-white/15 hover:border-[#B89560] text-xs font-semibold text-[#F5F1E8] rounded-lg transition-all flex items-center gap-2"
            >
              <Link2 size={14} className="text-[#B89560]" />
              <span>Meesho Link</span>
            </Link>

            <Link
              href="/admin/products/new/manual"
              className="px-4 py-2 bg-[#B89560] hover:bg-[#A38250] text-[#101010] text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus size={15} />
              <span>+ Add Dress</span>
            </Link>
          </div>
        </div>

        {/* Minimal Search & Filters Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#161616] border border-white/10 p-3 rounded-xl">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B9ADA1]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dress name or keywords..."
              className="w-full bg-[#101010] border border-white/10 rounded-lg pl-9 pr-8 py-2 text-xs text-[#F5F1E8] placeholder-[#B9ADA1]/50 focus:border-[#B89560] focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#B9ADA1] hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#101010] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F5F1E8] focus:border-[#B89560] focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Status Pills */}
            <div className="flex items-center bg-[#101010] p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  statusFilter === 'ALL' ? 'bg-[#B89560] text-[#101010]' : 'text-[#B9ADA1] hover:text-white'
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setStatusFilter('PUBLISHED')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  statusFilter === 'PUBLISHED' ? 'bg-emerald-500 text-[#101010]' : 'text-[#B9ADA1] hover:text-white'
                }`}
              >
                Live ({liveCount})
              </button>
              <button
                onClick={() => setStatusFilter('DRAFT')}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  statusFilter === 'DRAFT' ? 'bg-amber-400 text-[#101010]' : 'text-[#B9ADA1] hover:text-white'
                }`}
              >
                Drafts ({draftCount})
              </button>
            </div>
          </div>
        </div>

        {/* Clean Minimal Products Table */}
        <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-24 text-center">
              <RefreshCw size={24} className="animate-spin text-[#B89560] mx-auto mb-2" />
              <p className="text-xs text-[#B9ADA1]">Loading real-time products...</p>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="py-20 text-center">
              <ShoppingBag size={32} className="text-[#B9ADA1]/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-[#F5F1E8] mb-1">No products found</p>
              <p className="text-xs text-[#B9ADA1] mb-4">
                {search ? 'Try clearing your search filter.' : 'Upload your first dress or import a link from Meesho.'}
              </p>
              <Link
                href="/admin/products/new/manual"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B89560] text-[#101010] text-xs font-bold rounded-lg uppercase tracking-wider"
              >
                <Plus size={14} />
                <span>+ Upload Dress</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#121212] text-[11px] font-semibold uppercase tracking-wider text-[#B9ADA1]">
                    <th className="py-3.5 px-4">Dress / Product</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Website Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayedProducts.map((p) => {
                    const isLive = p.status === 'PUBLISHED';
                    const coverImg = p.coverImage || '/media/products/women-1.jpg';

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Dress Image + Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-16 bg-[#101010] rounded-md overflow-hidden border border-white/10 shrink-0">
                              <img
                                src={coverImg}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-editorial text-sm font-bold text-[#F5F1E8] group-hover:text-[#B89560] transition-colors">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#B9ADA1]">
                                <span>{p.categoryName || p.category}</span>
                                <span>&middot;</span>
                                <span className="font-mono text-[10px] text-[#B9ADA1]/70">{p.slug}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-semibold text-[#F5F1E8]">
                          {formatINR(p.pricePaise)}
                          {p.compareAtPricePaise && p.compareAtPricePaise > p.pricePaise && (
                            <span className="block text-[10px] text-[#B9ADA1]/60 line-through">
                              {formatINR(p.compareAtPricePaise)}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.totalStock > 5
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : p.totalStock > 0
                                ? 'bg-amber-400/15 text-amber-400'
                                : 'bg-red-500/15 text-red-400'
                            }`}
                          >
                            {p.totalStock} in stock
                          </span>
                        </td>

                        {/* Source Tag */}
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-semibold text-[#B9ADA1] uppercase px-2 py-0.5 rounded bg-white/5 border border-white/5">
                            {p.sourcingType === 'MEESHO' ? 'Meesho' : 'Own'}
                          </span>
                        </td>

                        {/* Website Live Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(p)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                              isLive
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                                : 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60'
                            }`}
                            title="Click to toggle between Published and Draft"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                              }`}
                            />
                            {isLive ? 'Live on Store' : 'Draft (Hidden)'}
                          </button>
                        </td>

                        {/* Action Buttons: View, Edit, Delete */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Live */}
                            {isLive && (
                              <a
                                href={`/product/${p.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-[#101010] border border-white/10 hover:border-[#B89560] text-[#B9ADA1] hover:text-[#B89560] transition-colors"
                                title="View dress on live website"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}

                            {/* Edit */}
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="p-1.5 rounded-lg bg-[#101010] border border-white/10 hover:border-[#B89560] text-[#B9ADA1] hover:text-[#F5F1E8] transition-colors"
                              title="Edit product details & prices"
                            >
                              <Edit2 size={13} />
                            </Link>

                            {/* Delete (Instant Real-time) */}
                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              className="p-1.5 rounded-lg bg-[#101010] border border-white/10 hover:border-rose-600 text-[#B9ADA1] hover:text-rose-400 transition-colors"
                              title="Delete dress permanently"
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
