'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Edit2,
  Clock,
  ArrowRight,
  PackageCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  coverImage: string;
  sourcingType: string;
  supplierStatus: string;
  supplierSourceUrl?: string;
  supplierNotes?: string;
  supplierVerificationDate?: string;
  totalStock: number;
  variants: Array<{
    id: string;
    sku: string;
    size: string;
    colorName: string;
    stockCount: number;
    availabilityMode: string;
  }>;
  updatedAt: string;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [supplierStatusFilter, setSupplierStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (supplierStatusFilter !== 'ALL') params.set('supplierStatus', supplierStatusFilter);
      if (sourceFilter !== 'ALL') params.set('source', sourceFilter);

      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.inventory || []);
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [supplierStatusFilter, sourceFilter]);

  // Quick Stock Update
  const handleUpdateStock = async (productId: string, variantId: string, newStock: number) => {
    setUpdatingId(variantId);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, stockCount: newStock }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) => {
            if (item.id === productId) {
              const updatedVariants = item.variants.map((v) =>
                v.id === variantId ? { ...v, stockCount: newStock } : v
              );
              const totalStock = updatedVariants.reduce((s, v) => s + v.stockCount, 0);
              return { ...item, variants: updatedVariants, totalStock };
            }
            return item;
          })
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Quick Supplier Status Update
  const handleUpdateSupplierStatus = async (productId: string, status: string) => {
    setUpdatingId(productId);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, supplierStatus: status }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === productId
              ? { ...item, supplierStatus: status, supplierVerificationDate: new Date().toISOString() }
              : item
          )
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="pb-6 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
                SUPPLIER &amp; WAREHOUSE INVENTORY CONTROL
              </span>
              <Layers size={14} className="text-gold" />
            </div>
            <h1 className="font-editorial text-3xl font-bold text-ivory mt-1">
              Inventory &amp; Supplier Sourcing Workflow
            </h1>
            <p className="text-xs text-stone mt-1 max-w-2xl">
              Strict fulfillment gating: customer orders for supplier-sourced items require independent supplier availability verification before acceptance.
            </p>
          </div>

          <button
            type="button"
            onClick={loadInventory}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-charcoal border border-white/10 hover:border-gold rounded-lg text-xs text-stone hover:text-ivory"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sync Inventory</span>
          </button>
        </div>

        {/* ORDER FULFILLMENT WORKFLOW DIAGRAM */}
        <div className="p-6 rounded-2xl bg-charcoal border border-gold/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-lg font-bold text-ivory flex items-center gap-2">
              <ShieldCheck size={18} className="text-gold" />
              <span>Mandatory Supplier Order Fulfilment Protocol</span>
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-gold font-bold">
              Zero Unauthorized Purchases Guaranteed
            </span>
          </div>

          {/* 7-Step Workflow Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-sans">
            <div className="p-3 rounded-lg bg-obsidian border border-white/5 space-y-1">
              <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[10px] flex items-center justify-center font-bold">1</span>
              <p className="font-bold text-ivory text-[11px]">Customer Order</p>
              <p className="text-[10px] text-stone/70">Order received &amp; payment held</p>
            </div>

            <div className="p-3 rounded-lg bg-obsidian border border-gold/40 space-y-1">
              <span className="w-5 h-5 rounded-full bg-gold text-obsidian text-[10px] flex items-center justify-center font-bold">2</span>
              <p className="font-bold text-gold text-[11px]">Supplier Audit</p>
              <p className="text-[10px] text-gold/80">Staff verifies physical stock</p>
            </div>

            <div className="p-3 rounded-lg bg-obsidian border border-white/5 space-y-1">
              <span className="w-5 h-5 rounded-full bg-white/10 text-ivory text-[10px] flex items-center justify-center font-bold">3</span>
              <p className="font-bold text-ivory text-[11px]">Purchase Confirm</p>
              <p className="text-[10px] text-stone/70">Manual authorized procurement</p>
            </div>

            <div className="p-3 rounded-lg bg-obsidian border border-white/5 space-y-1">
              <span className="w-5 h-5 rounded-full bg-white/10 text-ivory text-[10px] flex items-center justify-center font-bold">4</span>
              <p className="font-bold text-ivory text-[11px]">Inward Studio QC</p>
              <p className="text-[10px] text-stone/70">Quality inspection &amp; tagging</p>
            </div>

            <div className="p-3 rounded-lg bg-obsidian border border-white/5 space-y-1">
              <span className="w-5 h-5 rounded-full bg-white/10 text-ivory text-[10px] flex items-center justify-center font-bold">5</span>
              <p className="font-bold text-ivory text-[11px]">Express Dispatch</p>
              <p className="text-[10px] text-stone/70">Delhivery tracking generation</p>
            </div>

            <div className="p-3 rounded-lg bg-obsidian border border-white/5 space-y-1">
              <span className="w-5 h-5 rounded-full bg-white/10 text-ivory text-[10px] flex items-center justify-center font-bold">6</span>
              <p className="font-bold text-ivory text-[11px]">Doorstep Delivery</p>
              <p className="text-[10px] text-stone/70">Delivered to customer</p>
            </div>

            <div className="p-3 rounded-lg bg-obsidian border border-white/5 space-y-1">
              <span className="w-5 h-5 rounded-full bg-white/10 text-ivory text-[10px] flex items-center justify-center font-bold">7</span>
              <p className="font-bold text-ivory text-[11px]">Reconciliation</p>
              <p className="text-[10px] text-stone/70">Gross margin confirmed</p>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-xl bg-charcoal border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-stone mr-2">Source:</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-obsidian border border-white/10 rounded-lg px-3 py-1.5 text-stone text-xs"
              >
                <option value="ALL">All Sources</option>
                <option value="MEESHO">Meesho Sourced Only</option>
                <option value="OWN">Own Stock Only</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-stone mr-2">Supplier Verification:</label>
              <select
                value={supplierStatusFilter}
                onChange={(e) => setSupplierStatusFilter(e.target.value)}
                className="bg-obsidian border border-white/10 rounded-lg px-3 py-1.5 text-stone text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="VERIFIED">Verified / Available</option>
                <option value="VERIFICATION_PENDING">Verification Pending</option>
                <option value="NOT_VERIFIED">Not Verified</option>
                <option value="OUT_OF_STOCK">Supplier Out of Stock</option>
                <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
              </select>
            </div>
          </div>

          <span className="text-stone">
            Showing <strong className="text-ivory">{items.length}</strong> items in inventory ledger
          </span>
        </div>

        {/* Inventory Matrix Table */}
        <div className="rounded-2xl bg-charcoal border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 bg-obsidian/60 text-stone uppercase font-bold tracking-wider text-[10px]">
                  <th className="p-4">Piece</th>
                  <th className="p-4">Sourcing Type</th>
                  <th className="p-4">Supplier Status</th>
                  <th className="p-4">Last Verified</th>
                  <th className="p-4">Total Stock</th>
                  <th className="p-4">Variant Stock Adjustments</th>
                  <th className="p-4 text-right">Source Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone/60">
                      {loading ? 'Fetching inventory data...' : 'No inventory records found.'}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      {/* Piece */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 rounded bg-obsidian overflow-hidden border border-white/10 shrink-0">
                            <Image src={item.coverImage} alt={item.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-editorial font-bold text-ivory line-clamp-1">{item.name}</p>
                            <p className="text-[10px] text-stone/60 font-mono">{item.category}</p>
                          </div>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="p-4">
                        {item.sourcingType === 'MEESHO' || item.sourcingType === 'ON_DEMAND' ? (
                          <span className="px-2 py-0.5 rounded bg-gold/15 text-gold text-[10px] font-bold uppercase border border-gold/30">
                            Meesho Sourced
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-white/10 text-ivory text-[10px] font-bold uppercase">
                            Own Stock
                          </span>
                        )}
                      </td>

                      {/* Supplier Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={item.supplierStatus}
                          onChange={(e) => handleUpdateSupplierStatus(item.id, e.target.value)}
                          className={`rounded px-2.5 py-1 text-[11px] font-bold border focus:outline-none ${
                            item.supplierStatus === 'AVAILABLE' || item.supplierStatus === 'VERIFIED'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : item.supplierStatus === 'VERIFICATION_PENDING'
                              ? 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                              : 'bg-red-500/15 text-red-400 border-red-500/30'
                          }`}
                        >
                          <option value="VERIFIED">Verified / Available</option>
                          <option value="AVAILABLE">Available</option>
                          <option value="VERIFICATION_PENDING">Verification Pending</option>
                          <option value="NOT_VERIFIED">Not Verified</option>
                          <option value="OUT_OF_STOCK">Supplier Out of Stock</option>
                          <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
                        </select>
                      </td>

                      {/* Last Verified */}
                      <td className="p-4 text-stone text-[11px]">
                        {item.supplierVerificationDate ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Clock size={11} />
                            <span>{new Date(item.supplierVerificationDate).toLocaleDateString()}</span>
                          </span>
                        ) : (
                          <span className="text-stone/40">Not Yet Verified</span>
                        )}
                      </td>

                      {/* Total Stock */}
                      <td className="p-4 font-bold text-ivory text-sm">
                        {item.totalStock} units
                      </td>

                      {/* Variant Stock Adjustments */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {item.variants.map((v) => (
                            <div
                              key={v.id}
                              className="flex items-center gap-1.5 p-1 px-2 rounded bg-obsidian border border-white/5 text-[10px]"
                            >
                              <span className="text-gold font-bold">{v.size}:</span>
                              <input
                                type="number"
                                min="0"
                                defaultValue={v.stockCount}
                                onBlur={(e) => {
                                  const newVal = Number(e.target.value);
                                  if (newVal !== v.stockCount) {
                                    handleUpdateStock(item.id, v.id, newVal);
                                  }
                                }}
                                className="w-12 bg-charcoal border border-white/10 rounded px-1 text-ivory font-bold text-center"
                              />
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Source Link */}
                      <td className="p-4 text-right">
                        {item.supplierSourceUrl ? (
                          <a
                            href={item.supplierSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 inline-flex items-center gap-1 text-gold hover:underline text-[11px] font-semibold"
                          >
                            <span>Supplier</span>
                            <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span className="text-stone/40 text-[11px]">In-House</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
