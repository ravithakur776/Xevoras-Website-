'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatINR } from '@/lib/utils/format';
import {
  UploadCloud,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Eye,
  ExternalLink,
  DollarSign,
  Layers,
  Globe,
  Save,
} from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [gender, setGender] = useState<'women' | 'men' | 'unisex'>('women');
  const [categoryId, setCategoryId] = useState('women-dresses');
  const [categories, setCategories] = useState<any[]>([]);
  const [brand, setBrand] = useState('XEVORAS');
  const [productType, setProductType] = useState('Dress');
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState('');
  const [pattern, setPattern] = useState('');
  const [occasion, setOccasion] = useState('');
  const [sleeveType, setSleeveType] = useState('');
  const [neckType, setNeckType] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('PUBLISHED');
  const [featured, setFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [sourcingType, setSourcingType] = useState<'OWN' | 'MEESHO'>('OWN');
  const [supplierStatus, setSupplierStatus] = useState('VERIFIED');
  const [supplierSourceUrl, setSupplierSourceUrl] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');

  // Pricing
  const [sellingPrice, setSellingPrice] = useState(0);
  const [compareAtPrice, setCompareAtPrice] = useState<number | null>(null);
  const [costPrice, setCostPrice] = useState(0);
  const [shippingExpense, setShippingExpense] = useState(70);
  const [packagingExpense, setPackagingExpense] = useState(40);
  const [otherOverheads, setOtherOverheads] = useState(30);

  // Images & Variants
  const [images, setImages] = useState<Array<{ url: string; isCover: boolean; alt: string }>>([]);
  const [variants, setVariants] = useState<Array<{
    id?: string;
    sku: string;
    size: string;
    colorName: string;
    stock: number;
    availabilityMode: string;
  }>>([]);

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Submission
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load product & categories
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch('/api/admin/categories'),
        ]);

        if (catRes.ok) {
          const cData = await catRes.json();
          if (cData.categories) setCategories(cData.categories);
        }

        if (!prodRes.ok) throw new Error('Product not found or unauthorized');
        const pData = await prodRes.json();
        const p = pData.product;

        setName(p.name);
        setSlug(p.slug);
        setDescription(p.description || '');
        setShortDescription(p.shortDescription || '');
        setGender(p.gender);
        setCategoryId(p.categoryId);
        setBrand(p.brand || 'XEVORAS');
        setProductType(p.productType || 'Apparel');
        setFabric(p.fabric || p.material || '');
        setFit(p.fit || '');
        setPattern(p.pattern || '');
        setOccasion(p.occasion || '');
        setSleeveType(p.sleeveType || '');
        setNeckType(p.neckType || '');
        setCareInstructions(p.careInstructions || '');
        setStatus(p.status);
        setFeatured(Boolean(p.featured));
        setIsNewArrival(Boolean(p.isNewArrival));
        setIsTrending(Boolean(p.isTrending));
        setSourcingType(p.sourcingType === 'MEESHO' || p.sourcingType === 'ON_DEMAND' ? 'MEESHO' : 'OWN');
        setSupplierStatus(p.supplierStatus || 'VERIFIED');
        setSupplierSourceUrl(p.supplierSourceUrl || '');
        setSupplierNotes(p.supplierNotes || '');

        setSellingPrice(p.pricePaise / 100);
        setCompareAtPrice(p.compareAtPricePaise ? p.compareAtPricePaise / 100 : null);
        setCostPrice((p.costPricePaise || 0) / 100);
        setShippingExpense((p.shippingCostPaise || 7000) / 100);
        setPackagingExpense((p.packagingCostPaise || 3000) / 100);
        setOtherOverheads((p.otherExpensesPaise || 0) / 100);

        setSeoTitle(p.seoTitle || '');
        setSeoDescription(p.seoDescription || '');

        setImages(
          p.media && p.media.length > 0
            ? p.media.map((m: any) => ({ url: m.url, isCover: m.isCover, alt: m.altText || p.name }))
            : [{ url: '/media/products/women-1.jpg', isCover: true, alt: p.name }]
        );

        setVariants(
          p.variants && p.variants.length > 0
            ? p.variants.map((v: any) => ({
                id: v.id,
                sku: v.sku,
                size: v.size,
                colorName: v.colorName,
                stock: v.stockCount,
                availabilityMode: v.availabilityMode || 'OWN_VERIFIED',
              }))
            : []
        );
      } catch (err: any) {
        setLoadError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    if (id) init();
  }, [id]);

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('altText', name || file.name);

        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.media) {
          setImages((prev) => [
            ...prev,
            { url: data.media.url, isCover: prev.length === 0, alt: name || file.name },
          ]);
        }
      }
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Submit Changes
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const payload = {
        name,
        slug,
        description,
        shortDescription,
        gender,
        categoryId,
        brand,
        productType,
        fabric,
        fit,
        pattern,
        occasion,
        sleeveType,
        neckType,
        careInstructions,
        status,
        featured,
        isNewArrival,
        isTrending,
        sourcingType,
        supplierStatus,
        supplierSourceUrl,
        supplierNotes,
        pricePaise: Math.round(sellingPrice * 100),
        compareAtPricePaise: compareAtPrice ? Math.round(compareAtPrice * 100) : null,
        costPricePaise: Math.round(costPrice * 100),
        shippingCostPaise: Math.round(shippingExpense * 100),
        packagingCostPaise: Math.round(packagingExpense * 100),
        otherExpensesPaise: Math.round(otherOverheads * 100),
        seoTitle,
        seoDescription,
        images,
        variants: variants.map((v) => ({
          sku: v.sku,
          size: v.size,
          colorName: v.colorName,
          stock: v.stock,
          availabilityMode: v.availabilityMode,
        })),
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Error updating product');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations
  const totalCost = costPrice + shippingExpense + packagingExpense + otherOverheads;
  const estimatedContribution = sellingPrice - totalCost - Math.round(sellingPrice * 0.02);
  const estimatedMarginPercent = sellingPrice > 0 ? Number(((estimatedContribution / sellingPrice) * 100).toFixed(1)) : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center text-stone">
          <RefreshCw size={20} className="animate-spin text-gold" />
          <span className="ml-2 text-xs">Loading piece from database...</span>
        </div>
      </AdminLayout>
    );
  }

  if (loadError) {
    return (
      <AdminLayout>
        <div className="p-8 text-center space-y-4">
          <p className="text-red-400 font-bold">{loadError}</p>
          <Link href="/admin/products" className="text-xs text-gold hover:underline">
            &larr; Return to Product Matrix
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleUpdate} className="max-w-5xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="pb-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
                EDIT CATALOGUE PIECE
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-stone text-[10px] font-mono">
                {id}
              </span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">
              {name}
            </h1>
            <p className="text-xs text-stone mt-1">
              Modify inventory specifications, pricing margins, variant stock, and publication status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {status === 'PUBLISHED' && (
              <a
                href={`/product/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-charcoal border border-white/10 hover:border-gold rounded text-xs text-gold flex items-center gap-1.5"
              >
                <Eye size={13} />
                <span>View Live</span>
                <ExternalLink size={11} />
              </a>
            )}
            <Link
              href="/admin/products"
              className="px-3.5 py-2 bg-charcoal border border-white/10 hover:border-gold rounded text-xs text-stone hover:text-ivory"
            >
              All Products
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Product updated and synchronized with live database catalog!</span>
          </div>
        )}
        {saveError && (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{saveError}</span>
          </div>
        )}

        {/* Basic Details */}
        <div className="p-6 rounded-2xl bg-charcoal border border-white/10 space-y-4 text-xs font-sans">
          <h2 className="font-editorial text-xl font-bold text-ivory border-b border-white/5 pb-3">
            Core Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-stone font-bold uppercase mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory font-editorial text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone font-bold uppercase mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory focus:outline-none focus:border-gold font-bold"
              >
                <option value="PUBLISHED">PUBLISHED (Live on Storefront)</option>
                <option value="DRAFT">DRAFT (Hidden from Storefront)</option>
                <option value="ARCHIVED">ARCHIVED (Archived)</option>
              </select>
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory focus:outline-none focus:border-gold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.gender})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory focus:outline-none focus:border-gold"
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Sourcing Type</label>
              <select
                value={sourcingType}
                onChange={(e) => setSourcingType(e.target.value as any)}
                className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory focus:outline-none focus:border-gold"
              >
                <option value="OWN">Own Stock / In-House</option>
                <option value="MEESHO">Meesho Sourced / On-Demand</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Economics */}
        <div className="p-6 rounded-2xl bg-charcoal border border-gold/40 space-y-4 text-xs font-sans">
          <h2 className="font-editorial text-xl font-bold text-ivory border-b border-white/5 pb-3 flex items-center justify-between">
            <span>Pricing &amp; Margins</span>
            <span className="text-gold font-bold">{estimatedMarginPercent}% Gross Margin</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gold font-bold uppercase mb-1">Selling Price (INR) *</label>
              <input
                type="number"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full bg-obsidian border-2 border-gold rounded p-2 text-gold font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-stone font-bold uppercase mb-1">MRP / Compare Price (INR)</label>
              <input
                type="number"
                min="0"
                value={compareAtPrice || 0}
                onChange={(e) => setCompareAtPrice(Number(e.target.value))}
                className="w-full bg-obsidian border border-white/10 rounded p-2 text-ivory focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-stone font-bold uppercase mb-1">Cost Price (INR)</label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full bg-obsidian border border-white/10 rounded p-2 text-ivory focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="p-6 rounded-2xl bg-charcoal border border-white/10 space-y-4 text-xs font-sans">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="font-editorial text-xl font-bold text-ivory">Product Imagery</h2>
            <label className="px-3 py-1.5 rounded bg-charcoal border border-white/10 hover:border-gold text-gold cursor-pointer font-bold">
              + Upload More Photos
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 group ${
                  img.isCover ? 'border-gold shadow-gold' : 'border-white/10'
                }`}
              >
                <Image src={img.url} alt={img.alt} fill className="object-cover" />
                {img.isCover && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-gold text-obsidian text-[10px] font-bold uppercase">
                    Cover
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1 rounded bg-red-500 text-white"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.map((im, i) => ({ ...im, isCover: i === idx })))}
                      className="w-full py-1 rounded bg-charcoal border border-gold/40 text-gold text-[10px] uppercase font-bold"
                    >
                      Set Cover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Variants & Stock */}
        <div className="p-6 rounded-2xl bg-charcoal border border-white/10 space-y-4 text-xs font-sans">
          <h2 className="font-editorial text-xl font-bold text-ivory border-b border-white/5 pb-3">
            Variants &amp; Stock Count
          </h2>

          <div className="space-y-2">
            {variants.map((v, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-obsidian border border-white/5 flex items-center justify-between gap-4">
                <span className="font-mono text-gold font-bold">{v.sku}</span>
                <span className="text-ivory font-bold">{v.size}</span>
                <span className="text-stone">{v.colorName}</span>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-stone">Stock:</label>
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].stock = Number(e.target.value);
                      setVariants(updated);
                    }}
                    className="w-20 bg-charcoal border border-white/10 rounded px-2 py-1 text-ivory font-bold focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        <div className="p-6 rounded-2xl bg-charcoal border border-white/15 flex items-center justify-between sticky bottom-4 shadow-2xl z-20 backdrop-blur-md bg-charcoal/95">
          <Link href="/admin/products" className="text-stone hover:text-ivory text-xs">
            Cancel &amp; Discard
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 btn-gold rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold"
          >
            {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Product Changes</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
