'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MarginService } from '@/lib/services/margin.service';
import { OrderService } from '@/lib/services/order.service';
import { CatalogService } from '@/lib/services/catalog.service';
import { Product, Order, SourcingStatus } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils/format';
import {
  TrendingUp,
  Plus,
  Upload,
  Download,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  DollarSign,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';

interface SupplierProductRecord {
  id: string;
  name: string;
  supplierName: string;
  supplierSku: string;
  supplierUrl: string;
  supplierCostPaise: number;
  sellingPricePaise: number;
  shippingExpensePaise: number;
  packagingExpensePaise: number;
  availableSizes: string[];
  stockStatus: 'available' | 'low_stock' | 'discontinued';
  verifiedAt: string;
  internalNotes?: string;
}

export default function ResellingPage() {
  const [supplierProducts, setSupplierProducts] = useState<SupplierProductRecord[]>([]);
  const [resaleOrders, setResaleOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from DB
  const fetchResellingData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/reselling');
      if (res.ok) {
        const data = await res.json();
        if (data.supplierProducts && data.supplierProducts.length > 0) {
          setSupplierProducts(data.supplierProducts);
        }
        if (data.resaleOrders && data.resaleOrders.length > 0) {
          setResaleOrders(data.resaleOrders);
        }
      }
    } catch (e) {
      console.error('Failed to load reselling DB data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchResellingData();
  }, []);

  // Interactive Margin Calculator Playground
  const [calcSelling, setCalcSelling] = useState(1990);
  const [calcCost, setCalcCost] = useState(650);
  const [calcShip, setCalcShip] = useState(70);
  const [calcPack, setCalcPack] = useState(30);

  const activeMargin = MarginService.calculateMargin(
    Math.round(calcSelling * 100),
    Math.round(calcCost * 100),
    Math.round(calcShip * 100),
    Math.round(calcPack * 100)
  );

  // Manual Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importName, setImportName] = useState('');
  const [importSupplier, setImportSupplier] = useState('Meesho Verified Partner');
  const [importSku, setImportSku] = useState('');
  const [importCost, setImportCost] = useState(500);
  const [importPrice, setImportPrice] = useState(1490);
  const [importUrl, setImportUrl] = useState('');
  const [importError, setImportError] = useState('');
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);

  const handleManualImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');

    if (!importName || !importSku) {
      setImportError('Please provide product name and supplier SKU.');
      return;
    }

    if (supplierProducts.some((p) => p.supplierSku.toLowerCase() === importSku.trim().toLowerCase())) {
      setImportError(`Duplicate SKU: ${importSku} already registered in the reselling index.`);
      return;
    }

    setIsSubmittingImport(true);

    try {
      const res = await fetch('/api/reselling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: importName.trim(),
          supplierName: importSupplier.trim(),
          supplierSku: importSku.trim(),
          supplierCostPaise: Math.round(importCost * 100),
          sellingPricePaise: Math.round(importPrice * 100),
          supplierUrl: importUrl.trim() || 'https://meesho.com',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to persist supplier product to database.');
      }

      await fetchResellingData();
      setShowImportModal(false);
      setImportName('');
      setImportSku('');
      setImportUrl('');
    } catch (err: any) {
      // Fallback local update if offline or admin auth not set
      const newSupplierProduct: SupplierProductRecord = {
        id: 'sp_' + Date.now(),
        name: importName,
        supplierName: importSupplier,
        supplierSku: importSku.trim(),
        supplierUrl: importUrl.trim() || 'https://meesho.com',
        supplierCostPaise: Math.round(importCost * 100),
        sellingPricePaise: Math.round(importPrice * 100),
        shippingExpensePaise: 7000,
        packagingExpensePaise: 3000,
        availableSizes: ['S', 'M', 'L', 'XL'],
        stockStatus: 'available',
        verifiedAt: new Date().toISOString(),
      };
      setSupplierProducts([newSupplierProduct, ...supplierProducts]);
      setShowImportModal(false);
      setImportName('');
      setImportSku('');
    } finally {
      setIsSubmittingImport(false);
    }
  };

  const handleUpdateSourcingStatus = async (orderId: string, newStatus: SourcingStatus) => {
    OrderService.updateSourcingStatus(orderId, newStatus);
    setResaleOrders([...OrderService.getResaleOrders()]);

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, sourcingStatus: newStatus }),
      });
    } catch (e) {
      // Local state already updated
    }
  };

  const handleExportCsv = () => {
    const headers = ['Supplier SKU', 'Product Name', 'Supplier Cost (INR)', 'Selling Price (INR)', 'Gross Profit (INR)', 'Margin %', 'Status'];
    const rows = supplierProducts.map((p) => {
      const m = MarginService.calculateMargin(p.sellingPricePaise, p.supplierCostPaise, p.shippingExpensePaise, p.packagingExpensePaise);
      return [
        p.supplierSku,
        `"${p.name}"`,
        (p.supplierCostPaise / 100).toFixed(0),
        (p.sellingPricePaise / 100).toFixed(0),
        (m.grossMarginPaise / 100).toFixed(0),
        `${m.grossMarginPercentage}%`,
        p.stockStatus,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `xevoras_reselling_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-baseline justify-between pb-6 border-b border-white/5 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
                SUPPLIER &amp; WHOLESALE SOURCING
              </span>
              <TrendingUp size={14} className="text-gold" />
            </div>
            <h1 className="font-editorial text-3xl font-bold text-ivory mt-1">
              Meesho &amp; Supplier Reselling Manager
            </h1>
            <p className="text-xs text-stone mt-1 max-w-xl">
              Strictly compliant sourcing workflow for on-demand partner workshop pieces with automated financial margin math.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-charcoal border border-white/10 hover:border-gold rounded text-xs text-stone hover:text-ivory transition-colors"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 btn-gold rounded text-xs font-bold uppercase tracking-wider shadow-gold"
            >
              <Plus size={14} />
              <span>Import Supplier Product</span>
            </button>
          </div>
        </div>

        {/* Compliance Notice Banner */}
        <div className="p-4 rounded-xl bg-charcoal/60 border border-gold/30 flex items-start gap-3">
          <ShieldAlert size={20} className="text-gold flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-stone font-sans">
            <p className="font-bold text-ivory">Compliant Marketplace Sourcing Guidelines</p>
            <p>
              Automated screen-scraping of external portals without partner API credentials violates platform terms. Sourcing operates through compliant manual ingestion, approved supplier feeds, and verified wholesale partner invoices.
            </p>
          </div>
        </div>

        {/* Section 1: Real-Time Margin Economics Calculator */}
        <div className="p-6 rounded-xl bg-charcoal border border-white/10 space-y-6">
          <h2 className="font-editorial text-xl font-bold text-ivory flex items-center gap-2">
            <DollarSign size={18} className="text-gold" />
            <span>Sourcing Economics &amp; Gross Margin Engine</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
            <div>
              <label className="block text-stone font-bold uppercase mb-1">Selling Price (INR)</label>
              <input
                type="number"
                value={calcSelling}
                onChange={(e) => setCalcSelling(Number(e.target.value))}
                className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory font-bold focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-stone font-bold uppercase mb-1">Supplier Cost (INR)</label>
              <input
                type="number"
                value={calcCost}
                onChange={(e) => setCalcCost(Number(e.target.value))}
                className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory font-bold focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-stone font-bold uppercase mb-1">Shipping Expense (INR)</label>
              <input
                type="number"
                value={calcShip}
                onChange={(e) => setCalcShip(Number(e.target.value))}
                className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory font-bold focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-stone font-bold uppercase mb-1">Packaging (INR)</label>
              <input
                type="number"
                value={calcPack}
                onChange={(e) => setCalcPack(Number(e.target.value))}
                className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory font-bold focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Margin Results Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div className="p-4 rounded-lg bg-obsidian border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-stone font-bold">Total Unit Landed Cost</span>
              <p className="font-sans text-xl font-bold text-ivory mt-1">
                {formatINR(activeMargin.totalCostPaise)}
              </p>
              <p className="text-[10px] text-stone mt-0.5">Includes 2% platform reserve</p>
            </div>

            <div className="p-4 rounded-lg bg-obsidian border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-stone font-bold">Gross Margin (Profit)</span>
              <p className="font-sans text-xl font-bold text-emerald-400 mt-1">
                {formatINR(activeMargin.grossMarginPaise)}
              </p>
              <p className="text-[10px] text-stone mt-0.5">Retained profit per unit</p>
            </div>

            <div className="p-4 rounded-lg bg-obsidian border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-stone font-bold">Margin Health Tier</span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    activeMargin.healthTier === 'optimal'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : activeMargin.healthTier === 'moderate'
                      ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {activeMargin.grossMarginPercentage}% &middot; {activeMargin.healthTier.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Supplier Fulfilment Pipeline (On-Demand Orders) */}
        <div className="space-y-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
              FULFILMENT PIPELINE
            </span>
            <h2 className="font-editorial text-2xl font-bold text-ivory mt-1">
              Supplier-Sourced Order Lifecycle
            </h2>
            <p className="text-xs text-stone">
              Progression: New Order &rarr; Supplier Verification &rarr; Purchase &rarr; Supplier Shipped &rarr; Received &amp; QC &rarr; Customer Dispatch
            </p>
          </div>

          <div className="rounded-xl bg-charcoal border border-white/5 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-gold uppercase tracking-wider font-semibold">
                  <th className="p-4">Customer Order</th>
                  <th className="p-4">Sourced Item</th>
                  <th className="p-4">Customer Price</th>
                  <th className="p-4">Est. Margin</th>
                  <th className="p-4">Sourcing Stage</th>
                  <th className="p-4">Supplier Order ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {resaleOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="font-mono font-bold text-ivory">{ord.orderNumber}</p>
                      <p className="text-[10px] text-stone">{ord.customer.fullName} &middot; {ord.customer.city}</p>
                    </td>
                    <td className="p-4">
                      {ord.items.map((i) => (
                        <div key={i.sku}>
                          <p className="font-bold text-ivory">{i.productName}</p>
                          <p className="text-[10px] text-stone">SKU: {i.sku} &middot; Size: {i.size}</p>
                        </div>
                      ))}
                    </td>
                    <td className="p-4 font-bold text-ivory">{formatINR(ord.totalPaise)}</td>
                    <td className="p-4">
                      <span className="font-bold text-emerald-400">
                        {formatINR(ord.totalPaise - 65000 - 10000)}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={ord.sourcingStatus}
                        onChange={(e) => handleUpdateSourcingStatus(ord.id, e.target.value as SourcingStatus)}
                        className="bg-obsidian border border-white/10 text-ivory text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-gold capitalize"
                      >
                        <option value="to_source">To Source</option>
                        <option value="purchased">Purchased</option>
                        <option value="supplier_shipped">Supplier Shipped</option>
                        <option value="received_qc_passed">Received &amp; QC Passed</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="e.g. MSH-ORD-9914"
                        defaultValue={ord.supplierOrderId || ''}
                        onBlur={(e) => OrderService.updateSourcingStatus(ord.id, ord.sourcingStatus, e.target.value)}
                        className="bg-obsidian border border-white/10 rounded px-2 py-1 text-xs text-ivory placeholder-stone/30 focus:outline-none focus:border-gold"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Registered Supplier Sourcing Catalogue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-ivory">Registered Sourcing Items</h2>
              <p className="text-xs text-stone">Indexed external wholesale pieces eligible for on-demand customer orders</p>
            </div>
          </div>

          <div className="rounded-xl bg-charcoal border border-white/5 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-gold uppercase tracking-wider font-semibold">
                  <th className="p-4">Supplier SKU</th>
                  <th className="p-4">Item &amp; Partner</th>
                  <th className="p-4">Wholesale Cost</th>
                  <th className="p-4">XEVORAS Selling</th>
                  <th className="p-4">Net Unit Margin</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {supplierProducts.map((sp) => {
                  const m = MarginService.calculateMargin(sp.sellingPricePaise, sp.supplierCostPaise);
                  return (
                    <tr key={sp.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono font-bold text-gold">{sp.supplierSku}</td>
                      <td className="p-4">
                        <p className="font-bold text-ivory">{sp.name}</p>
                        <p className="text-[11px] text-stone">{sp.supplierName}</p>
                      </td>
                      <td className="p-4 text-stone">{formatINR(sp.supplierCostPaise)}</td>
                      <td className="p-4 font-bold text-ivory">{formatINR(sp.sellingPricePaise)}</td>
                      <td className="p-4">
                        <span className="font-bold text-emerald-400">
                          {formatINR(m.grossMarginPaise)} ({m.grossMarginPercentage}%)
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">
                          {sp.stockStatus}
                        </span>
                      </td>
                      <td className="p-4 text-stone/60">{formatDate(sp.verifiedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-charcoal border border-white/10 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-editorial text-xl font-bold text-ivory">Import Supplier Product</h3>
              <button type="button" onClick={() => setShowImportModal(false)} className="text-stone">✕</button>
            </div>

            {importError && (
              <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{importError}</p>
            )}

            <form onSubmit={handleManualImport} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-stone font-bold uppercase mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  placeholder="e.g. Zari Embroidered Kaftan"
                  className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">Supplier SKU *</label>
                  <input
                    type="text"
                    required
                    value={importSku}
                    onChange={(e) => setImportSku(e.target.value)}
                    placeholder="e.g. MSH-KA-102"
                    className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={importSupplier}
                    onChange={(e) => setImportSupplier(e.target.value)}
                    className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">Supplier Cost (INR) *</label>
                  <input
                    type="number"
                    required
                    value={importCost}
                    onChange={(e) => setImportCost(Number(e.target.value))}
                    className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">XEVORAS Selling (INR) *</label>
                  <input
                    type="number"
                    required
                    value={importPrice}
                    onChange={(e) => setImportPrice(Number(e.target.value))}
                    className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone font-bold uppercase mb-1">Supplier / Sourcing Reference URL</label>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-gold rounded text-xs uppercase tracking-wider font-bold shadow-gold mt-4"
              >
                Index Supplier Product
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
