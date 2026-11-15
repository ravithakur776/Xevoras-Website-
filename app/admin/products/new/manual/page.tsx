'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Sliders,
  ShieldCheck,
} from 'lucide-react';

export default function ManualProductUploadPage() {
  const router = useRouter();

  // SECTION A: BASIC INFORMATION
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [gender, setGender] = useState<'women' | 'men' | 'unisex'>('women');
  const [categoryId, setCategoryId] = useState('women-dresses');
  const [collectionId, setCollectionId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [brand, setBrand] = useState('XEVORAS Atelier');
  const [productType, setProductType] = useState('Dress');
  const [fabric, setFabric] = useState('100% Silk Twill');
  const [pattern, setPattern] = useState('Solid Minimalist');
  const [fit, setFit] = useState('Tailored Architectural');
  const [occasion, setOccasion] = useState('Evening Gala & Red Carpet');
  const [sleeveType, setSleeveType] = useState('Full Length Sculpted Cuff');
  const [neckType, setNeckType] = useState('High Band Stand Collar');
  const [careInstructions, setCareInstructions] = useState('Professional dry clean only. Cool iron on reverse.');
  const [keywords, setKeywords] = useState('silk, gown, architectural, luxury, minimalist');

  // SECTION B: PRODUCT PHOTOGRAPHY
  const [images, setImages] = useState<Array<{ url: string; isCover: boolean; alt: string; tag: string }>>([
    { url: '/media/products/women-2.jpg', isCover: true, alt: 'Front view', tag: 'Front View' },
  ]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  // SECTION C: PRICING
  const [purchaseCost, setPurchaseCost] = useState(1200); // ₹1,200
  const [shippingExpense, setShippingExpense] = useState(70);
  const [packagingExpense, setPackagingExpense] = useState(50);
  const [otherOverheads, setOtherOverheads] = useState(40);
  const [sellingPrice, setSellingPrice] = useState(4890); // ₹4,890
  const [mrpPrice, setMrpPrice] = useState(7490); // ₹7,490 MRP

  // SECTION D & E: VARIANTS & INVENTORY
  const [variants, setVariants] = useState<Array<{
    sku: string;
    size: string;
    colorName: string;
    colorHex: string;
    stock: number;
    lowStockThreshold: number;
  }>>([
    { sku: 'XV-ATL-S-01', size: 'S', colorName: 'Obsidian Noir', colorHex: '#101010', stock: 12, lowStockThreshold: 3 },
    { sku: 'XV-ATL-M-01', size: 'M', colorName: 'Obsidian Noir', colorHex: '#101010', stock: 18, lowStockThreshold: 4 },
    { sku: 'XV-ATL-L-01', size: 'L', colorName: 'Obsidian Noir', colorHex: '#101010', stock: 14, lowStockThreshold: 3 },
  ]);

  // SECTION F: DISPLAY SETTINGS
  const [featured, setFeatured] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isTrending, setIsTrending] = useState(true);

  // SECTION G: SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Status & Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [publishedSuccess, setPublishedSuccess] = useState<{ id: string; slug: string; status: string } | null>(null);

  // Load Categories & Collections
  useEffect(() => {
    async function loadTaxonomies() {
      try {
        const [catRes, colRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/collections'),
        ]);
        if (catRes.ok) {
          const cData = await catRes.json();
          if (cData.categories) setCategories(cData.categories);
        }
        if (colRes.ok) {
          const clData = await colRes.json();
          if (clData.collections) setCollections(clData.collections);
        }
      } catch (err) {
        console.error('Failed to load taxonomies', err);
      }
    }
    loadTaxonomies();
  }, []);

  // Sync slug and SEO
  useEffect(() => {
    if (name && !slug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50));
    }
    if (name && !seoTitle) {
      setSeoTitle(`${name} — XEVORAS Archive`);
    }
    if (description && !seoDescription) {
      setSeoDescription(description.slice(0, 150));
    }
  }, [name, description]);

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, tag: string = 'Editorial View') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setImageUploadError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('altText', `${name || 'Product'} - ${tag}`);

        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload image');

        setImages((prev) => [
          ...prev,
          {
            url: data.media.url,
            isCover: prev.length === 0,
            alt: `${name || 'Product'} - ${tag}`,
            tag,
          },
        ]);
      }
    } catch (err: any) {
      setImageUploadError(err.message || 'Image upload error');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSetCover = (idx: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isCover: i === idx })));
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
      if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  // Add Variant
  const handleAddVariant = (size: string, color: string) => {
    const cleanSku = `XV-ATL-${(slug || 'PIECE').toUpperCase()}-${size}-${Math.floor(10 + Math.random() * 90)}`;
    setVariants((prev) => [
      ...prev,
      {
        sku: cleanSku,
        size,
        colorName: color,
        colorHex: '#101010',
        stock: 10,
        lowStockThreshold: 3,
      },
    ]);
  };

  // Pricing math
  const totalCost = purchaseCost + shippingExpense + packagingExpense + otherOverheads;
  const estimatedContribution = sellingPrice - totalCost - Math.round(sellingPrice * 0.02);
  const estimatedMarginPercent = sellingPrice > 0 ? Number(((estimatedContribution / sellingPrice) * 100).toFixed(1)) : 0;
  const discountPercent = mrpPrice > sellingPrice ? Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100) : 0;

  // Submit Product
  const handleSubmitProduct = async (statusToSet: 'DRAFT' | 'PUBLISHED') => {
    if (!name.trim()) {
      setSubmissionError('Please enter a product title.');
      return;
    }
    if (sellingPrice <= 0) {
      setSubmissionError('Selling price must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const payload = {
        name,
        slug: slug.trim() || undefined,
        description,
        shortDescription,
        gender,
        categoryId,
        collectionId: collectionId || null,
        pricePaise: Math.round(sellingPrice * 100),
        compareAtPricePaise: mrpPrice ? Math.round(mrpPrice * 100) : null,
        costPricePaise: Math.round(purchaseCost * 100),
        shippingCostPaise: Math.round(shippingExpense * 100),
        packagingCostPaise: Math.round(packagingExpense * 100),
        otherExpensesPaise: Math.round(otherOverheads * 100),
        brand,
        productType,
        fabric,
        pattern,
        fit,
        occasion,
        sleeveType,
        neckType,
        careInstructions,
        keywords,
        status: statusToSet,
        featured,
        isNewArrival,
        isTrending,
        sourcingType: 'OWN',
        supplierStatus: 'AVAILABLE',
        seoTitle,
        seoDescription,
        images,
        variants: variants.map((v) => ({
          sku: v.sku,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          stock: v.stock,
          costPricePaise: Math.round(purchaseCost * 100),
          sellingPricePaise: Math.round(sellingPrice * 100),
          status: 'ACTIVE',
          availabilityMode: 'OWN_VERIFIED',
        })),
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product in database.');
      }

      setPublishedSuccess({
        id: data.product.id,
        slug: data.product.slug,
        status: statusToSet,
      });
    } catch (err: any) {
      setSubmissionError(err.message || 'Error uploading product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="pb-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
                IN-HOUSE PRODUCTION ATELIER
              </span>
              <Sparkles size={13} className="text-gold" />
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">
              Upload Your Own Clothing Product
            </h1>
            <p className="text-xs text-stone mt-1 max-w-xl">
              Complete professional multi-section product creation. Register in-house studio pieces, multi-angle photography, inventory thresholds, and SEO parameters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="px-3.5 py-2 bg-charcoal border border-white/10 hover:border-gold rounded text-xs text-stone hover:text-ivory"
            >
              Back to Catalog
            </Link>
          </div>
        </div>

        {/* Success Modal / Banner */}
        {publishedSuccess && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-left space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="font-editorial text-xl font-bold text-ivory">
                  Product Successfully {publishedSuccess.status === 'PUBLISHED' ? 'Published on Storefront' : 'Saved as Draft'}!
                </h3>
                <p className="text-xs text-stone mt-0.5">
                  Record persisted in database with ID: <span className="font-mono text-ivory font-bold">{publishedSuccess.id}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              {publishedSuccess.status === 'PUBLISHED' && (
                <a
                  href={`/product/${publishedSuccess.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 btn-gold rounded text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 shadow-gold"
                >
                  <Eye size={14} />
                  <span>View on Live Storefront</span>
                  <ExternalLink size={12} />
                </a>
              )}
              <Link
                href="/admin/products"
                className="px-4 py-2.5 bg-charcoal border border-white/10 hover:border-gold rounded text-xs text-ivory font-bold uppercase tracking-wider"
              >
                Go to Product Matrix
              </Link>
              <button
                type="button"
                onClick={() => {
                  setPublishedSuccess(null);
                  setName('');
                  setSlug('');
                  setDescription('');
                }}
                className="px-4 py-2.5 bg-obsidian border border-white/10 hover:border-gold rounded text-xs text-stone hover:text-ivory"
              >
                Upload Another Piece
              </button>
            </div>
          </div>
        )}

        {/* SECTION A: BASIC INFORMATION */}
        <div className="p-6 sm:p-8 rounded-2xl bg-charcoal border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-editorial text-xl font-bold text-ivory flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold text-obsidian text-xs flex items-center justify-center font-bold">A</span>
              <span>Basic Information &amp; Editorial Identity</span>
            </h2>
            <span className="text-[11px] text-stone">Section A</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-sans">
            <div className="sm:col-span-2">
              <label className="block text-stone font-bold uppercase mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Bias-Cut Satin Evening Gown"
                className="w-full bg-obsidian border border-white/10 rounded-lg p-3 text-ivory placeholder-stone/40 focus:outline-none focus:border-gold text-sm font-editorial"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone font-bold uppercase mb-1">Short Description / Subtitle</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Architectural floor-length silhouette with sculpted boat neckline"
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone font-bold uppercase mb-1">Editorial Description *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Crafted from 100% heavyweight silk twill with a lustrous fluid drape. Cut on the bias to gently hug the body without clinging..."
                className="w-full bg-obsidian border border-white/10 rounded-lg p-3 text-ivory placeholder-stone/40 focus:outline-none focus:border-gold leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Gender Collection *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory focus:outline-none focus:border-gold"
              >
                <option value="women">Women’s Collection</option>
                <option value="men">Men’s Collection</option>
                <option value="unisex">Unisex Edition</option>
              </select>
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory focus:outline-none focus:border-gold"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.gender})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="women-dresses">Dresses &amp; Gowns</option>
                    <option value="women-trousers">Trousers &amp; Skirts</option>
                    <option value="men-shirts">Weighted Shirts</option>
                    <option value="men-denim">Rigid Denim</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Brand / Studio Label</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Product Tags / Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="silk, gown, evening, tailored, satin"
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* SECTION B: MULTI-ANGLE PHOTOGRAPHY */}
        <div className="p-6 sm:p-8 rounded-2xl bg-charcoal border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-editorial text-xl font-bold text-ivory flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold text-obsidian text-xs flex items-center justify-center font-bold">B</span>
              <span>Product Photography &amp; Editorial Angles</span>
            </h2>
            <span className="text-[11px] text-stone">Section B</span>
          </div>

          <div className="p-6 rounded-xl border-2 border-dashed border-white/15 hover:border-gold/60 text-center space-y-3 bg-obsidian/50 transition-colors">
            <UploadCloud size={32} className="text-gold mx-auto" />
            <div>
              <p className="text-xs font-bold text-ivory">Upload Studio Photography (Front, Back, Side, Detail)</p>
              <p className="text-[10px] text-stone/60 mt-0.5">Persisted to /uploads/products/ with real database media indexing</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'Editorial View')}
              disabled={uploadingImage}
              className="text-xs text-stone file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-charcoal file:text-gold hover:file:bg-gold hover:file:text-obsidian file:cursor-pointer cursor-pointer"
            />
            {uploadingImage && (
              <p className="text-xs text-gold flex items-center justify-center gap-1.5 pt-2">
                <RefreshCw size={13} className="animate-spin" />
                <span>Uploading and optimizing media...</span>
              </p>
            )}
            {imageUploadError && <p className="text-xs text-red-400">{imageUploadError}</p>}
          </div>

          {/* Uploaded Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.url + idx}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all group ${
                  img.isCover ? 'border-gold shadow-gold' : 'border-white/10'
                }`}
              >
                <Image src={img.url} alt={img.alt || `Product ${idx}`} fill className="object-cover" />

                {img.isCover && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-gold text-obsidian text-[10px] font-bold uppercase tracking-wider shadow">
                    Cover
                  </span>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 rounded bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      className="w-full py-1.5 rounded bg-charcoal/90 border border-gold/40 text-gold text-[10px] uppercase font-bold hover:bg-gold hover:text-obsidian transition-colors"
                    >
                      Set as Cover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION C: PRICING & ECONOMICS */}
        <div className="p-6 sm:p-8 rounded-2xl bg-charcoal border border-gold/40 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-editorial text-xl font-bold text-ivory flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold text-obsidian text-xs flex items-center justify-center font-bold">C</span>
              <span>Pricing Structure &amp; Margin Economics</span>
            </h2>
            <DollarSign size={18} className="text-gold" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
            <div>
              <label className="block text-stone font-bold uppercase mb-1">Production Landed Cost (INR) *</label>
              <input
                type="number"
                min="0"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(Number(e.target.value))}
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory font-bold focus:outline-none focus:border-gold"
              />
              <span className="text-[10px] text-stone/60">Fabric, cutting &amp; artisanal assembly</span>
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Estimated Shipping (INR)</label>
              <input
                type="number"
                min="0"
                value={shippingExpense}
                onChange={(e) => setShippingExpense(Number(e.target.value))}
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory font-bold focus:outline-none focus:border-gold"
              />
              <span className="text-[10px] text-stone/60">Express dispatch allowance</span>
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Packaging (INR)</label>
              <input
                type="number"
                min="0"
                value={packagingExpense}
                onChange={(e) => setPackagingExpense(Number(e.target.value))}
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory font-bold focus:outline-none focus:border-gold"
              />
              <span className="text-[10px] text-stone/60">Rigid luxury presentation box</span>
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Other Overheads (INR)</label>
              <input
                type="number"
                min="0"
                value={otherOverheads}
                onChange={(e) => setOtherOverheads(Number(e.target.value))}
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory font-bold focus:outline-none focus:border-gold"
              />
              <span className="text-[10px] text-stone/60">Studio handling &amp; insurance</span>
            </div>

            <div>
              <label className="block text-gold font-bold uppercase mb-1">XEVORAS Selling Price (INR) *</label>
              <input
                type="number"
                min="1"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full bg-obsidian border-2 border-gold rounded-lg p-2.5 text-gold font-bold text-sm focus:outline-none shadow-gold"
              />
              <span className="text-[10px] text-gold/80">Listed retail price on store</span>
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">MRP Anchor (INR)</label>
              <input
                type="number"
                min="0"
                value={mrpPrice}
                onChange={(e) => setMrpPrice(Number(e.target.value))}
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory font-bold focus:outline-none focus:border-gold"
              />
              <span className="text-[10px] text-stone/60">Reference strike price</span>
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Calculated Discount</label>
              <div className="w-full bg-obsidian/70 border border-white/5 rounded-lg p-2.5 text-emerald-400 font-bold">
                {discountPercent > 0 ? `${discountPercent}% OFF` : 'Full Retail Price'}
              </div>
              <span className="text-[10px] text-stone/60">Discount percentage</span>
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Total Unit Cost</label>
              <div className="w-full bg-obsidian/70 border border-white/5 rounded-lg p-2.5 text-ivory font-bold">
                ₹{totalCost}
              </div>
              <span className="text-[10px] text-stone/60">Sum of all inward costs</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-obsidian border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[11px] text-stone uppercase tracking-wider block">Total Unit Cost</span>
              <p className="text-xl font-bold text-ivory mt-1">₹{totalCost}</p>
            </div>
            <div>
              <span className="text-[11px] text-stone uppercase tracking-wider block">Estimated Net Contribution</span>
              <p className="text-xl font-bold mt-1 text-emerald-400">₹{estimatedContribution}</p>
              <span className="text-[9px] text-stone/60">After 2% payment processing</span>
            </div>
            <div>
              <span className="text-[11px] text-stone uppercase tracking-wider block">Gross Margin Percentage</span>
              <p className={`text-2xl font-bold mt-0.5 ${estimatedMarginPercent >= 50 ? 'text-emerald-400' : 'text-gold'}`}>
                {estimatedMarginPercent}%
              </p>
              <span className="text-[9px] text-stone/60">High luxury contribution margin</span>
            </div>
          </div>
        </div>

        {/* SECTION D & E: VARIANTS & INVENTORY */}
        <div className="p-6 sm:p-8 rounded-2xl bg-charcoal border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-editorial text-xl font-bold text-ivory flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold text-obsidian text-xs flex items-center justify-center font-bold">D &amp; E</span>
              <span>Sizes, Colours &amp; Physical Inventory Limits</span>
            </h2>
            <Layers size={18} className="text-stone" />
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-obsidian border border-white/5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
              >
                <div className="sm:col-span-3">
                  <label className="block text-[10px] uppercase text-stone/60 mb-0.5">SKU *</label>
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].sku = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-full bg-charcoal border border-white/10 rounded px-2.5 py-1.5 text-ivory font-mono focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase text-stone/60 mb-0.5">Size *</label>
                  <select
                    value={v.size}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].size = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-full bg-charcoal border border-white/10 rounded px-2.5 py-1.5 text-ivory focus:outline-none focus:border-gold"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] uppercase text-stone/60 mb-0.5">Colour *</label>
                  <input
                    type="text"
                    value={v.colorName}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].colorName = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-full bg-charcoal border border-white/10 rounded px-2.5 py-1.5 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase text-stone/60 mb-0.5">Physical Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].stock = Number(e.target.value);
                      setVariants(updated);
                    }}
                    className="w-full bg-charcoal border border-white/10 rounded px-2.5 py-1.5 text-ivory font-bold focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between">
                  <div>
                    <label className="block text-[10px] uppercase text-stone/60 mb-0.5">Low-Stock Alert</label>
                    <input
                      type="number"
                      min="1"
                      value={v.lowStockThreshold}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[idx].lowStockThreshold = Number(e.target.value);
                        setVariants(updated);
                      }}
                      className="w-20 bg-charcoal border border-white/10 rounded px-2 py-1.5 text-stone text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-stone hover:text-red-400 p-1 mt-3"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-stone flex items-center gap-1.5 mr-2">Quick Add Variant:</span>
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => handleAddVariant(sz, 'Obsidian Noir')}
                className="px-3 py-1 rounded bg-obsidian border border-white/10 hover:border-gold text-stone hover:text-ivory text-xs font-semibold"
              >
                + {sz}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION F & G: DISPLAY & SEO */}
        <div className="p-6 sm:p-8 rounded-2xl bg-charcoal border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-editorial text-xl font-bold text-ivory flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold text-obsidian text-xs flex items-center justify-center font-bold">F &amp; G</span>
              <span>Website Display &amp; Search Engine Optimization</span>
            </h2>
            <Globe size={18} className="text-stone" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <label className="p-4 rounded-xl bg-obsidian border border-white/10 cursor-pointer hover:border-gold flex items-center gap-3">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-gold w-4 h-4"
              />
              <div>
                <p className="font-bold text-ivory">Feature on Homepage</p>
                <p className="text-[10px] text-stone">Display in Curated Selection</p>
              </div>
            </label>

            <label className="p-4 rounded-xl bg-obsidian border border-white/10 cursor-pointer hover:border-gold flex items-center gap-3">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="accent-gold w-4 h-4"
              />
              <div>
                <p className="font-bold text-ivory">Show in New Arrivals</p>
                <p className="text-[10px] text-stone">Tagged with New Arrival badge</p>
              </div>
            </label>

            <label className="p-4 rounded-xl bg-obsidian border border-white/10 cursor-pointer hover:border-gold flex items-center gap-3">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="accent-gold w-4 h-4"
              />
              <div>
                <p className="font-bold text-ivory">Add to Trending Carousel</p>
                <p className="text-[10px] text-stone">Highlight in high-engagement grid</p>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans pt-2">
            <div>
              <label className="block text-stone font-bold uppercase mb-1">SEO Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Meta title for Google search"
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-stone font-bold uppercase mb-1">Custom URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. the-bias-cut-gown"
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory font-mono focus:outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone font-bold uppercase mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Brief meta description for search engine rich snippets"
                className="w-full bg-obsidian border border-white/10 rounded-lg p-2.5 text-ivory focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* SAVE & PUBLISH ACTION BAR */}
        <div className="p-6 rounded-2xl bg-charcoal border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-2xl z-20 backdrop-blur-md bg-charcoal/95">
          <div>
            <p className="font-editorial text-base font-bold text-ivory">
              Save or Publish In-House Garment
            </p>
            <p className="text-xs text-stone">
              Publishing will immediately render this product across the live storefront catalog.
            </p>
          </div>

          {submissionError && (
            <p className="text-xs text-red-400 font-semibold">{submissionError}</p>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmitProduct('DRAFT')}
              className="flex-1 sm:flex-none px-5 py-3 rounded-lg bg-obsidian border border-white/15 hover:border-gold text-ivory text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmitProduct('PUBLISHED')}
              className="flex-1 sm:flex-none px-6 py-3 btn-gold rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <span>Publish on XEVORAS</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
