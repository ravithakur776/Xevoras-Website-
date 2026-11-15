'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatINR } from '@/lib/utils/format';
import { normalizeImageUrl } from '@/lib/utils/image';
import {
  Link2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Eye,
  DollarSign,
  TrendingUp,
  Tag,
  Layers,
  ShoppingBag,
  Image as ImageIcon,
  UploadCloud,
  Bookmark,
  Copy,
  Check,
} from 'lucide-react';

interface AutoFilledData {
  name: string;
  slug: string;
  description: string;
  gender: 'women' | 'men' | 'unisex';
  categoryId: string;
  categoryName: string;
  fabric: string;
  pattern: string;
  fit: string;
  occasion: string;
  sleeveType: string;
  neckType: string;
  careInstructions: string;
  costPricePaise: number;
  pricePaise: number;
  compareAtPricePaise: number;
  profitPaise: number;
  marginPercent: number;
  sourceUrl: string;
  sourceProductId: string;
  coverImage: string;
  galleryImages: string[];
  variants: Array<{
    size: string;
    sku: string;
    stockCount: number;
    pricePaise: number;
  }>;
}

const SAMPLE_MEESHO_LINKS = [
  { label: 'Dark Blue Jeans', url: 'https://www.meesho.com/dark-blue-straight-fit-wide-legg-jeans/p/92oblv', price: 375 },
  { label: 'Anarkali Kurta Set', url: 'https://www.meesho.com/women-embroidered-georgette-anarkali-kurta-set/p/8k9x1', price: 499 },
  { label: 'Banarasi Silk Saree', url: 'https://www.meesho.com/designer-silk-saree-with-blouse-piece/p/7z2m4', price: 650 },
  { label: 'Printed Co-ord Set', url: 'https://www.meesho.com/cotton-blend-printed-kurti-palazzo-set/p/5a3b2', price: 420 },
  { label: 'Men Slim Shirt', url: 'https://www.meesho.com/men-cotton-casual-slim-fit-shirt/p/6y1p9', price: 349 },
];

export default function MeeshoAutoImportPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-xs text-stone">Loading Meesho importer...</div>}>
      <MeeshoAutoImportContent />
    </Suspense>
  );
}

function MeeshoAutoImportContent() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState('');
  const [speedPrice, setSpeedPrice] = useState('');
  const [speedImage, setSpeedImage] = useState('');

  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [autoFilled, setAutoFilled] = useState<AutoFilledData | null>(null);
  const [publishedProduct, setPublishedProduct] = useState<{ name: string; slug: string; liveUrl: string } | null>(null);

  // Editable fields within the auto-filled result
  const [editableName, setEditableName] = useState('');
  const [editableCost, setEditableCost] = useState(375);
  const [editablePrice, setEditablePrice] = useState(1299);
  const [editableImage, setEditableImage] = useState('');
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [showBookmarkletHelp, setShowBookmarkletHelp] = useState(false);

  // Read URL query params if opened from bookmarklet or external shortcut
  useEffect(() => {
    const qUrl = searchParams.get('url');
    const qPrice = searchParams.get('price');
    const qImg = searchParams.get('img') || searchParams.get('image');
    const qTitle = searchParams.get('title');
    const qSizes = searchParams.get('sizes');

    if (qUrl) {
      setUrl(qUrl);
      if (qPrice) setSpeedPrice(qPrice);
      if (qImg) setSpeedImage(qImg);
      handleAutoFill(qUrl, qPrice ? Number(qPrice) : undefined, qImg || undefined, qTitle || undefined, qSizes || undefined);
    }
  }, [searchParams]);

  // Global clipboard listener: Paste copied Meesho images, screenshot, or URL anywhere!
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // 1. Check for image files in clipboard
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = reader.result as string;
                setEditableImage(base64);
                setSpeedImage(base64);
              };
              reader.readAsDataURL(file);
              return;
            }
          }
        }
      }

      // 2. Check for text in clipboard if not actively typing in an input
      const activeTag = document.activeElement?.tagName;
      if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
        const text = e.clipboardData?.getData('text')?.trim();
        if (text) {
          if (text.includes('meesho.com') && (text.includes('/p/') || text.includes('/s/'))) {
            setUrl(text);
          } else if (text.startsWith('http') && (text.includes('images.meesho.com') || text.match(/\.(jpg|jpeg|png|webp|avif)/i))) {
            const clean = normalizeImageUrl(text);
            setEditableImage(clean);
            setSpeedImage(clean);
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  // 1. Auto-Fill from Meesho URL
  const handleAutoFill = async (
    targetUrl?: string,
    overrideCost?: number,
    overrideImg?: string,
    overrideTitle?: string,
    overrideSizes?: string
  ) => {
    const urlToUse = targetUrl || url;
    if (!urlToUse || !urlToUse.trim()) {
      setError('Please paste a Meesho product link.');
      return;
    }

    setLoading(true);
    setError('');
    setPublishedProduct(null);

    const costNum = overrideCost !== undefined ? overrideCost : (speedPrice ? Number(speedPrice) : undefined);
    const imgUrl = overrideImg || speedImage || undefined;

    try {
      const res = await fetch('/api/admin/products/import/meesho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'autofill',
          url: urlToUse.trim(),
          customCostPaise: costNum ? Math.round(costNum * 100) : undefined,
          customImageUrl: imgUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to auto-fill details from Meesho link.');
      }

      const generated: AutoFilledData = data.autoFilled;
      if (overrideSizes) {
        const rawSizes = overrideSizes.split(',').map((s) => s.trim()).filter(Boolean);
        if (rawSizes.length > 0) {
          generated.variants = rawSizes.map((sz) => ({
            size: sz,
            sku: `XV-${generated.sourceProductId.toUpperCase()}-${sz}`,
            stockCount: 20,
            pricePaise: generated.pricePaise,
          }));
        }
      }

      setAutoFilled(generated);
      setEditableName(overrideTitle || generated.name);

      const finalCost = costNum || Math.round(generated.costPricePaise / 100);
      setEditableCost(finalCost);

      const retailFromAdapter = Math.round(generated.pricePaise / 100);
      setEditablePrice(retailFromAdapter || Math.max(Math.round((finalCost * 3.2) / 100) * 100 - 1, 899));

      setEditableImage(imgUrl || generated.coverImage);
      if (targetUrl) setUrl(targetUrl);
    } catch (err: any) {
      setError(err.message || 'Error auto-filling Meesho link.');
    } finally {
      setLoading(false);
    }
  };

  // Direct Image Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setEditableImage(base64);
      setSpeedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // 2. Publish Directly to Live Website & Database
  const handlePublish = async () => {
    if (!autoFilled) return;

    setPublishing(true);
    setError('');

    try {
      const finalImg = editableImage || autoFilled.coverImage;
      const payload = {
        ...autoFilled,
        name: editableName || autoFilled.name,
        pricePaise: Math.round(editablePrice * 100),
        costPricePaise: Math.round(editableCost * 100),
        compareAtPricePaise: Math.round(editablePrice * 2.1 * 100),
        coverImage: finalImg,
        galleryImages: [finalImg],
      };

      const res = await fetch('/api/admin/products/import/meesho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          url: autoFilled.sourceUrl,
          productData: payload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish product to live store.');
      }

      setPublishedProduct({
        name: data.product.name,
        slug: data.product.slug,
        liveUrl: data.product.liveUrl || `/product/${data.product.slug}`,
      });
      setAutoFilled(null);
      setUrl('');
      setSpeedPrice('');
      setSpeedImage('');
    } catch (err: any) {
      setError(err.message || 'Publishing failed.');
    } finally {
      setPublishing(false);
    }
  };

  const currentProfit = editablePrice - editableCost;
  const currentMargin = editablePrice > 0 ? Math.round((currentProfit / editablePrice) * 100) : 0;

  // The 1-Click Meesho Bookmarklet Code
  const bookmarkletCode = `javascript:(function(){try{var ogImg=document.querySelector('meta[property="og:image"]')?.content||document.querySelector('meta[name="twitter:image"]')?.content||document.querySelector('img[src*="images.meesho.com"]')?.src||document.querySelector('img[src*="meesho"]')?.src||'';var priceEl=Array.from(document.querySelectorAll('h4,span,p,div')).find(el=>el.children.length===0&&/₹\\s*[0-9,]+/.test(el.innerText));var priceMatch=priceEl?priceEl.innerText.match(/₹\\s*([0-9,]+)/):null;var price=priceMatch?priceMatch[1].replace(/,/g,''):'';var title=document.querySelector('h1')?.innerText?.trim()||document.querySelector('meta[property="og:title"]')?.content||document.title.replace(/\\|.*Meesho.*/i,'').trim();var sizeEls=Array.from(document.querySelectorAll('span,button,div')).map(e=>e.innerText?e.innerText.trim():'').filter(t=>/^(Free Size|XS|S|M|L|XL|XXL|XXXL|[0-9]{2})$/i.test(t));var sizes=Array.from(new Set(sizeEls)).slice(0,8).join(',');var target='http://localhost:3000/admin/products/import/meesho?url='+encodeURIComponent(location.href)+'&price='+encodeURIComponent(price)+'&img='+encodeURIComponent(ogImg)+'&title='+encodeURIComponent(title)+'&sizes='+encodeURIComponent(sizes);window.open(target,'_blank');}catch(e){alert('Meesho grabber error: '+e.message);}})();`;

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-20 font-sans">
        {/* Header */}
        <div className="border-b border-white/5 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold font-bold">
                1-CLICK MEESHO PRODUCT IMPORTER
              </span>
              <Sparkles size={13} className="text-gold" />
            </div>
            <h1 className="font-editorial text-3xl font-bold text-ivory">Real Meesho Details, Photo &amp; Price Importer</h1>
            <p className="text-xs text-stone mt-1 max-w-2xl">
              Paste any Meesho link. Enter the real Meesho price and photo, or use the 1-Click Bookmarklet to import in 1 click from your browser.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={bookmarkletCode}
              onClick={(e) => {
                setShowBookmarkletHelp(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-obsidian text-xs font-bold hover:bg-gold/90 transition-all shadow-lg shadow-gold/25 cursor-grab active:cursor-grabbing border border-gold/40"
              title="Drag this button directly to your Chrome Bookmarks Bar!"
            >
              <Sparkles size={14} className="text-obsidian" />
              <span>⭐ Drag to Bookmarks: <strong>Import to XEVORAS</strong></span>
            </a>
          </div>
        </div>

        {/* 1-Click Bookmarklet Guide Drawer */}
        {showBookmarkletHelp && (
          <div className="p-5 rounded-2xl bg-charcoal border border-gold/30 space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-ivory text-sm flex items-center gap-2">
                <Sparkles size={14} className="text-gold" />
                <span>⭐ 1-Click Chrome Bookmarklet (Instant Auto-Grabber)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBookmarkletHelp(false)}
                className="text-stone hover:text-ivory"
              >
                ✕
              </button>
            </div>
            <p className="text-stone leading-relaxed">
              When you browse products on Meesho in Chrome, just click <strong>&quot;Import to XEVORAS&quot;</strong> in your bookmarks bar. It automatically copies the <strong>Real Photo, Real Buying Price, Title, and Sizes</strong> directly from that tab into this panel in 1 second!
            </p>
            <div className="p-3.5 rounded-xl bg-obsidian border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-bold text-ivory">How to install (Takes 5 seconds):</p>
                <p className="text-[11px] text-stone">Simply drag the golden <strong>&quot;⭐ Drag to Bookmarks&quot;</strong> button above up to your Chrome Bookmarks bar. Or copy the code below:</p>
              </div>
              <button
                type="button"
                onClick={handleCopyBookmarklet}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-obsidian text-xs font-bold shrink-0 hover:bg-gold/90 transition-colors"
              >
                {copiedBookmarklet ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedBookmarklet ? 'Copied to Clipboard!' : 'Copy Bookmarklet Code'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Screen after Publishing */}
        {publishedProduct && (
          <div className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="font-editorial text-2xl font-bold text-ivory">Successfully Published to Live Website &amp; Database!</h2>
              <p className="text-xs text-stone/80 mt-1 max-w-md mx-auto">
                <span className="text-emerald-300 font-bold font-mono">{publishedProduct.name}</span> is now live in the catalogue, store, and database.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href={publishedProduct.liveUrl}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold text-obsidian text-xs font-bold hover:bg-gold/90 transition-all shadow-lg shadow-gold/20"
              >
                <Eye size={14} />
                <span>View Live Piece on Storefront</span>
                <ArrowRight size={13} />
              </Link>

              <button
                type="button"
                onClick={() => setPublishedProduct(null)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-charcoal border border-white/10 text-xs text-ivory hover:border-gold transition-all"
              >
                <RefreshCw size={13} />
                <span>Import Another Piece</span>
              </button>
            </div>
          </div>
        )}

        {/* Input Bar Card: 3 Speed Inputs */}
        <div className="p-6 rounded-2xl bg-charcoal border border-white/10 shadow-xl space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone">
            Step 1: Paste Meesho Link &amp; Details
          </label>

          <div className="space-y-3">
            {/* Main Meesho URL */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Link2 size={16} className="absolute left-3.5 top-3.5 text-stone/60" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAutoFill()}
                  placeholder="Paste Meesho link here (e.g. https://www.meesho.com/...)"
                  className="w-full bg-obsidian border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-ivory placeholder-stone/40 focus:outline-none focus:border-gold transition-colors font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAutoFill()}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold text-obsidian font-bold text-xs uppercase tracking-wider hover:bg-gold/90 transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-gold/15"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Auto-Filling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>⚡ Auto-Fill Everything</span>
                  </>
                )}
              </button>
            </div>

            {/* Fast Optional Inputs: Real Buying Price & Real Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gold text-xs font-bold">₹</span>
                <input
                  type="number"
                  value={speedPrice}
                  onChange={(e) => setSpeedPrice(e.target.value)}
                  placeholder="Real Meesho Buying Price (e.g. 389)"
                  className="w-full bg-obsidian border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-ivory placeholder-stone/40 focus:outline-none focus:border-gold font-mono"
                />
              </div>

              <div className="relative">
                <ImageIcon size={14} className="absolute left-3 top-2.5 text-stone/50" />
                <input
                  type="url"
                  value={speedImage}
                  onChange={(e) => {
                    const clean = normalizeImageUrl(e.target.value);
                    setSpeedImage(clean);
                    if (clean) setEditableImage(clean);
                  }}
                  placeholder="Paste Real Meesho Image Address (Right-click photo -> Copy Image Address)"
                  className="w-full bg-obsidian border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-ivory placeholder-stone/40 focus:outline-none focus:border-gold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Sample Links */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone/70">
            <span className="text-[10px] uppercase font-bold text-stone/50">Try sample pieces:</span>
            {SAMPLE_MEESHO_LINKS.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setUrl(sample.url);
                  setSpeedPrice(String(sample.price));
                  handleAutoFill(sample.url, sample.price);
                }}
                className="px-2.5 py-1 rounded-md bg-obsidian border border-white/5 hover:border-gold/50 text-stone hover:text-gold transition-colors text-[11px]"
              >
                {sample.label} (₹{sample.price})
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Auto-Filled Preview & Instant 1-Click Publish Card */}
        {autoFilled && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-ivory">
                  Step 2: Auto-Filled Details Ready
                </h2>
              </div>
              <span className="text-[11px] text-stone">
                Meesho ID: <strong className="text-gold font-mono">{autoFilled.sourceProductId}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Image Preview, Direct Paste & Device Upload */}
              <div className="p-5 rounded-2xl bg-charcoal border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs text-stone font-bold uppercase tracking-wider">
                  <span>Product Photography</span>
                  <ImageIcon size={14} className="text-gold" />
                </div>

                <div
                  className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-obsidian border-2 border-dashed border-white/20 hover:border-gold/60 transition-colors cursor-pointer group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text');
                    if (droppedUrl && (droppedUrl.startsWith('http') || droppedUrl.startsWith('data:'))) {
                      setEditableImage(droppedUrl);
                      return;
                    }
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = () => { setEditableImage(reader.result as string); };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to choose photo or Drag & Drop photo here"
                >
                  <Image
                    src={editableImage || '/media/products/women-1.jpg'}
                    alt={editableName}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                    unoptimized
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-obsidian/80 backdrop-blur-md text-[9px] font-mono text-gold border border-gold/30">
                    LIVE PREVIEW
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-1.5 text-[10px] text-ivory/90 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <UploadCloud size={13} className="text-gold" />
                    <span>Drop Photo Here or Click to Upload</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const items = await navigator.clipboard.read();
                        for (const item of items) {
                          for (const type of item.types) {
                            if (type.startsWith('image/')) {
                              const blob = await item.getType(type);
                              const reader = new FileReader();
                              reader.onload = () => { setEditableImage(reader.result as string); };
                              reader.readAsDataURL(blob);
                              return;
                            }
                          }
                        }
                        const text = await navigator.clipboard.readText();
                        if (text && (text.startsWith('http') || text.startsWith('data:'))) {
                          setEditableImage(text.trim());
                        }
                      } catch {
                        alert('Press Cmd+V (or Ctrl+V) to paste the photo directly!');
                      }
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-obsidian border border-white/10 hover:border-gold text-stone hover:text-ivory text-[11px] flex items-center justify-center gap-1.5 transition-colors font-medium"
                  >
                    <Copy size={12} className="text-gold" />
                    <span>Paste Photo (Cmd+V)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-1.5 px-2.5 rounded-lg bg-obsidian border border-white/10 hover:border-gold text-stone hover:text-ivory text-[11px] flex items-center justify-center gap-1.5 transition-colors font-medium shrink-0"
                  >
                    <UploadCloud size={12} />
                    <span>Upload</span>
                  </button>
                </div>

                {/* Direct Image URL input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-stone">
                    📷 Paste Real Meesho Image Address:
                  </label>
                  <input
                    type="url"
                    value={editableImage}
                    onChange={(e) => {
                      const clean = normalizeImageUrl(e.target.value);
                      setEditableImage(clean);
                      setSpeedImage(clean);
                    }}
                    placeholder="Right-click photo on Meesho -> Copy Image Address -> paste here"
                    className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-xs text-ivory placeholder-stone/30 focus:outline-none focus:border-gold font-mono"
                  />
                  <p className="text-[10px] text-stone/60">
                    Tip: Open Meesho &rarr; right-click photo &rarr; <strong>Copy Image Address</strong> &rarr; paste here.
                  </p>
                </div>

                {/* Upload from Computer */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <label className="text-[10px] uppercase font-bold text-stone">
                    📁 Or Upload Photo from Computer:
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-lg bg-obsidian border border-white/10 hover:border-gold text-stone hover:text-ivory text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <UploadCloud size={14} />
                    <span>Choose Photo from Device</span>
                  </button>
                </div>

                {/* Category Preset Switcher */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <label className="text-[10px] uppercase font-bold text-stone">
                    Or Pick Matching Presets:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {autoFilled.galleryImages.concat([
                      '/media/products/men-4.jpg',
                      '/media/products/trouser-1.jpg',
                      '/media/products/women-2.jpg',
                    ]).slice(0, 6).map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditableImage(imgUrl)}
                        className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${
                          editableImage === imgUrl ? 'border-gold ring-2 ring-gold/40' : 'border-white/10 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image src={imgUrl} alt="Preset" fill className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle & Right Column: Details, Sizing, Financials & 1-Click Publish */}
              <div className="lg:col-span-2 space-y-6">
                {/* Product Core Details */}
                <div className="p-6 rounded-2xl bg-charcoal border border-white/10 space-y-5">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone mb-1.5">
                      Product Title (Auto-Formatted)
                    </label>
                    <input
                      type="text"
                      value={editableName}
                      onChange={(e) => setEditableName(e.target.value)}
                      className="w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-ivory focus:outline-none focus:border-gold font-sans"
                    />
                  </div>

                  {/* Attributes Tag Cloud */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-obsidian border border-white/5">
                      <p className="text-[9px] uppercase font-bold text-stone/60">Category</p>
                      <p className="font-bold text-ivory mt-0.5">{autoFilled.categoryName}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-obsidian border border-white/5">
                      <p className="text-[9px] uppercase font-bold text-stone/60">Gender</p>
                      <p className="font-bold text-ivory mt-0.5 capitalize">{autoFilled.gender}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-obsidian border border-white/5">
                      <p className="text-[9px] uppercase font-bold text-stone/60">Fabric</p>
                      <p className="font-bold text-ivory mt-0.5 line-clamp-1">{autoFilled.fabric}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-obsidian border border-white/5">
                      <p className="text-[9px] uppercase font-bold text-stone/60">Occasion</p>
                      <p className="font-bold text-ivory mt-0.5 line-clamp-1">{autoFilled.occasion}</p>
                    </div>
                  </div>

                  {/* High Margin Financials */}
                  <div className="p-4 rounded-xl bg-obsidian border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone mb-1">
                        Meesho Real Buying Price (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-stone text-xs">₹</span>
                        <input
                          type="number"
                          value={editableCost}
                          onChange={(e) => {
                            const newCost = Number(e.target.value) || 0;
                            setEditableCost(newCost);
                            const suggested = Math.round((newCost * 3.2) / 100) * 100 - 1;
                            setEditablePrice(Math.max(suggested, 899));
                          }}
                          className="w-full bg-charcoal border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-xs font-bold text-ivory focus:outline-none focus:border-gold font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gold mb-1">
                        XEVORAS Live Selling Price (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gold text-xs">₹</span>
                        <input
                          type="number"
                          value={editablePrice}
                          onChange={(e) => setEditablePrice(Number(e.target.value) || 0)}
                          className="w-full bg-charcoal border border-gold/40 rounded-lg pl-7 pr-3 py-1.5 text-xs font-bold text-gold focus:outline-none focus:border-gold font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-center">
                      <span className="text-[9px] uppercase font-bold text-emerald-400">Calculated Net Profit</span>
                      <p className="text-base font-bold text-emerald-300 font-mono">
                        +₹{currentProfit.toLocaleString('en-IN')} <span className="text-xs font-normal">({currentMargin}%)</span>
                      </p>
                    </div>
                  </div>

                  {/* Sizes Matrix */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold text-stone">
                      Sizes Matrix &amp; Stock (Auto-Configured)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {autoFilled.variants.map((v, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 rounded-lg bg-obsidian border border-white/5 text-xs flex items-center gap-2"
                        >
                          <span className="font-bold text-ivory">{v.size}</span>
                          <span className="text-[10px] text-stone font-mono">({v.stockCount} in stock)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sourcing Source URL link */}
                  <div className="flex items-center justify-between text-[11px] text-stone pt-2 border-t border-white/5">
                    <span className="truncate max-w-sm">Source: {autoFilled.sourceUrl}</span>
                    <a
                      href={autoFilled.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-gold hover:underline shrink-0"
                    >
                      <span>Open on Meesho</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {/* THE 1-CLICK PUBLISH BUTTON */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-gold/15 via-gold/10 to-transparent border border-gold/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-editorial text-lg font-bold text-ivory">Ready to Go Live</h3>
                      <p className="text-xs text-stone">
                        Click below to save to backend, sync with catalogue.json, and publish directly to live storefront.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gold text-obsidian font-bold text-sm uppercase tracking-wider hover:bg-gold/90 transition-all shadow-xl shadow-gold/20 disabled:opacity-50"
                  >
                    {publishing ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Publishing to Live Website &amp; Database...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>🚀 Publish Directly to Live Website &amp; Database</span>
                      </>
                    )}
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
