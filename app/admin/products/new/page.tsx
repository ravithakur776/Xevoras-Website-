'use client';

import React from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Link2,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Sparkles,
  Camera,
} from 'lucide-react';

export default function NewProductChoicePage() {
  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
              CATALOGUE EXPANSION
            </span>
            <Sparkles size={13} className="text-gold" />
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">
            Add New Clothing Product
          </h1>
          <p className="text-xs text-stone mt-1 max-w-2xl">
            Choose your creation pathway. You can import on-demand inventory using a verified Meesho product link or upload original garments crafted by your own atelier.
          </p>
        </div>

        {/* The Two Prominent Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CARD 1: ADD FROM MEESHO LINK */}
          <div className="p-8 rounded-2xl bg-charcoal border-2 border-gold/40 hover:border-gold transition-all flex flex-col justify-between shadow-2xl relative group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl bg-gold/15 border border-gold/40 text-gold flex items-center justify-center">
                  <Link2 size={28} />
                </div>
                <span className="px-3 py-1 rounded-full bg-gold text-obsidian text-[10px] font-bold uppercase tracking-wider">
                  Option 01 &middot; Recommended
                </span>
              </div>

              <div>
                <h2 className="font-editorial text-2xl font-bold text-ivory group-hover:text-gold transition-colors">
                  Add from Meesho Link
                </h2>
                <p className="text-xs text-stone mt-2 leading-relaxed">
                  Fast sourcing workflow for dropshipping and supplier-sourced collections. Paste an official Meesho product URL to register the source link, compute real-time margins, verify inventory status, and draft the piece.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-white/5 font-sans text-xs text-stone">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-gold shrink-0" />
                  <span>Validates secure Meesho HTTPS domains</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-gold shrink-0" />
                  <span>Interactive gross margin &amp; profit economics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-gold shrink-0" />
                  <span>Supplier verification gate prior to order dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-gold shrink-0" />
                  <span>Compliant manual specification entry &amp; image staging</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/admin/products/import/meesho"
                className="w-full py-4 btn-gold rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold group-hover:shadow-gold-lg transition-all"
              >
                <span>Import via Meesho Link</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* CARD 2: UPLOAD YOUR OWN PRODUCT */}
          <div className="p-8 rounded-2xl bg-charcoal border border-white/10 hover:border-gold/60 transition-all flex flex-col justify-between shadow-2xl relative group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 text-ivory flex items-center justify-center">
                  <UploadCloud size={28} />
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-ivory text-[10px] font-bold uppercase tracking-wider">
                  Option 02 &middot; In-House
                </span>
              </div>

              <div>
                <h2 className="font-editorial text-2xl font-bold text-ivory group-hover:text-gold transition-colors">
                  Upload Your Own Product
                </h2>
                <p className="text-xs text-stone mt-2 leading-relaxed">
                  Full editorial creation workflow for in-house garments, studio dresses, and proprietary collections. Upload multi-angle photography, manage verified warehouse stock, specify fabric compositions, and configure custom SKUs.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-white/5 font-sans text-xs text-stone">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Multi-angle photography upload &amp; cover selector</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Granular size (XS–XXL) &amp; color variant matrix</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Physical warehouse stock limits &amp; low-stock alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Complete SEO titles, descriptions &amp; custom URL slugs</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/admin/products/new/manual"
                className="w-full py-4 rounded-lg bg-obsidian border border-white/15 hover:border-gold text-ivory text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-white/5"
              >
                <span>Upload Own Product</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Guidelines Footer */}
        <div className="p-4 rounded-xl bg-obsidian border border-white/5 text-stone/70 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-gold" />
            <span>All products are validated and published directly into the live XEVORAS database catalog.</span>
          </div>
          <Link href="/admin/products" className="text-gold hover:underline font-semibold">
            Manage Existing Pieces &rarr;
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
