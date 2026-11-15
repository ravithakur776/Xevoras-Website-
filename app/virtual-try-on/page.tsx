'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { INITIAL_PRODUCTS } from '@/lib/data/initialCatalog';
import { Product, TryOnJob } from '@/lib/types';
import { formatINR } from '@/lib/utils/format';
import { useCart } from '@/lib/store/cartContext';
import {
  Sparkles,
  Upload,
  Shield,
  Check,
  AlertCircle,
  ShoppingBag,
  Trash2,
  RefreshCw,
  Share2,
  Download,
  ArrowRight,
} from 'lucide-react';

export default function VirtualTryOnPage() {
  const { addItem } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasConsent, setHasConsent] = useState(false);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product>(INITIAL_PRODUCTS[0]);
  const [mode, setMode] = useState<'fast' | 'quality'>('quality');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultJob, setResultJob] = useState<TryOnJob | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50); // Percent for before/after
  const [errorMsg, setErrorMsg] = useState('');
  const [addedBag, setAddedBag] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10MB limit.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      setUserImagePreview(reader.result as string);
      setResultJob(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setUserImagePreview(null);
    setResultJob(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecuteTryOn = async () => {
    if (!hasConsent) {
      setErrorMsg('Please acknowledge the privacy consent before generating.');
      return;
    }

    if (!userImagePreview) {
      setErrorMsg('Please upload a full-length or upper-body photo first.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImageBase64: userImagePreview,
          clothingImageUrl: selectedProduct.images[0]?.url || '/media/products/women-1.jpg',
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          category: selectedProduct.category.includes('dresses') ? 'one-pieces' : 'tops',
          mode,
          consent: hasConsent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process try-on');
      }

      setResultJob(data.job);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while contacting vision provider.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadLook = () => {
    if (!resultJob) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Watermark header & branding
      ctx.fillStyle = 'rgba(16, 16, 16, 0.85)';
      ctx.fillRect(0, canvas.height - 140, canvas.width, 140);

      ctx.fillStyle = '#B89560';
      ctx.font = 'bold 36px serif';
      ctx.fillText('XEVORAS', 60, canvas.height - 75);

      ctx.fillStyle = '#F5F1E8';
      ctx.font = '22px sans-serif';
      ctx.fillText(
        `AI VIRTUAL FIT: ${selectedProduct.name.toUpperCase()} · ALWAYS RARE · हटके हमेशा`,
        60,
        canvas.height - 35
      );

      const link = document.createElement('a');
      link.download = `xevoras-virtual-look-${selectedProduct.slug}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = resultJob.resultImageUrl || selectedProduct.images[0]?.url || '/media/products/women-1.jpg';
  };

  const handleAddProductToCart = () => {
    if (!selectedProduct) return;
    const variant = selectedProduct.variants[0];
    addItem({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      slug: selectedProduct.slug,
      sku: variant.sku,
      size: variant.size,
      color: variant.colorName,
      pricePaise: selectedProduct.pricePaise,
      imageUrl: selectedProduct.images[0]?.url || '/media/products/women-1.jpg',
      sourcing: (selectedProduct.sourcing === 'on_demand' ? 'on_demand' : 'own'),
      quantity: 1,
    });
    setAddedBag(true);
    setTimeout(() => setAddedBag(false), 2000);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="pb-6 border-b border-white/5 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            NEURAL VISION STUDIO
          </span>
          <Sparkles size={14} className="text-gold" />
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-ivory mt-1">
          AI Virtual Try-On
        </h1>
        <p className="text-xs text-stone mt-1 max-w-xl">
          Preview how XEVORAS fluid gowns, structured shirts, and tailored layers look on your own photo with photorealistic drape.
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 mb-8 rounded-xl bg-charcoal/60 border border-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-gold flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-stone font-sans">
            <p className="font-bold text-ivory">Privacy &amp; Ephemeral Processing Shield</p>
            <p>
              Your photo is processed ephemerally in volatile memory and is never used to train machine learning models. Uploads are strictly restricted to your private session and purged automatically.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-ivory cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={hasConsent}
            onChange={(e) => setHasConsent(e.target.checked)}
            className="accent-gold w-4 h-4 rounded"
          />
          <span>I consent to photo try-on</span>
        </label>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Studio Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Photo & Garment Picker */}
        <div className="lg:col-span-6 space-y-6">
          {/* Step 1: Upload Customer Photo */}
          <div className="p-6 rounded-xl bg-charcoal border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-lg font-bold text-ivory flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gold text-obsidian text-xs flex items-center justify-center font-bold">1</span>
                <span>Your Standing Portrait</span>
              </h2>
              {userImagePreview && (
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="text-xs text-stone hover:text-red-400 flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {userImagePreview ? (
              <div className="relative aspect-[3/4] max-h-[360px] rounded-lg overflow-hidden bg-obsidian border border-white/10 mx-auto">
                <Image src={userImagePreview} alt="Customer Portrait" fill className="object-cover" />
                <div className="absolute top-2 right-2 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-bold uppercase backdrop-blur-md">
                  Photo Ready
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  if (!hasConsent) {
                    setErrorMsg('Please check the consent checkbox above first.');
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  hasConsent
                    ? 'border-white/15 hover:border-gold/60 bg-obsidian/40'
                    : 'border-white/5 opacity-50 cursor-not-allowed bg-obsidian/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gold mb-3">
                  <Upload size={22} />
                </div>
                <p className="font-editorial text-base font-bold text-ivory">Click to upload photo</p>
                <p className="text-xs text-stone mt-1">
                  Full-length or upper-body standing portrait with clear lighting (max 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Choose Garment from Catalogue */}
          <div className="p-6 rounded-xl bg-charcoal border border-white/10 space-y-4">
            <h2 className="font-editorial text-lg font-bold text-ivory flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gold text-obsidian text-xs flex items-center justify-center font-bold">2</span>
              <span>Select Garment to Audition</span>
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
              {INITIAL_PRODUCTS.map((prod) => {
                const isSelected = selectedProduct.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setSelectedProduct(prod);
                      setResultJob(null);
                    }}
                    className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-gold shadow-gold scale-95'
                        : 'border-white/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={prod.images[0]?.url || '/media/products/women-1.jpg'}
                      alt={prod.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-1 bg-obsidian/85 backdrop-blur-sm text-[9px] text-ivory font-bold truncate">
                      {prod.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quality / Speed Toggle */}
            <div className="pt-2 flex items-center justify-between text-xs text-stone border-t border-white/5">
              <span>Fidelity Preset:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('quality')}
                  className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                    mode === 'quality' ? 'bg-gold text-obsidian' : 'bg-obsidian text-stone hover:text-ivory'
                  }`}
                >
                  High-Fidelity
                </button>
                <button
                  type="button"
                  onClick={() => setMode('fast')}
                  className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                    mode === 'fast' ? 'bg-gold text-obsidian' : 'bg-obsidian text-stone hover:text-ivory'
                  }`}
                >
                  Fast Preview
                </button>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating || !userImagePreview || !hasConsent}
              onClick={handleExecuteTryOn}
              className={`w-full py-4 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                isGenerating || !userImagePreview || !hasConsent
                  ? 'bg-white/5 text-stone/40 cursor-not-allowed border border-white/5'
                  : 'btn-gold shadow-gold hover:shadow-gold-lg'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={15} className="animate-spin text-obsidian" />
                  <span>Synthesizing Neural Garment...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Generate AI Try-On Preview</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Comparison Stage */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-xl bg-charcoal border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-lg font-bold text-ivory">
                Result &amp; Drape Analysis
              </h2>
              {resultJob && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                  {resultJob.provider === 'fashn-ai' ? 'FASHN AI LIVE' : 'HIGH-FIDELITY DEMO'}
                </span>
              )}
            </div>

            {resultJob ? (
              <div className="space-y-4">
                {/* Interactive Before & After Split Slider */}
                <div
                  className="relative aspect-[3/4] rounded-xl overflow-hidden bg-obsidian border border-gold/30 shadow-2xl select-none cursor-ew-resize"
                  onMouseMove={(e) => {
                    if (e.buttons === 1) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                      setSliderPosition(Math.round((x / rect.width) * 100));
                    }
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    if (touch) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(rect.width, touch.clientX - rect.left));
                      setSliderPosition(Math.round((x / rect.width) * 100));
                    }
                  }}
                >
                  {/* Generated Result (Right side) */}
                  <Image
                    src={resultJob.resultImageUrl || selectedProduct.images[0]?.url || '/media/products/women-1.jpg'}
                    alt="AI Try On Result"
                    fill
                    className="object-cover pointer-events-none"
                  />

                  {/* Original Portrait (Left side, clipped by sliderPosition) */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <div className="relative w-full h-full min-w-[320px]">
                      <Image
                        src={resultJob.userImageUrl}
                        alt="Original Portrait"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Vertical Dividing Line & Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gold shadow-lg flex items-center justify-center cursor-ew-resize pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-obsidian border-2 border-gold flex items-center justify-center text-gold shadow-gold text-[10px] font-bold">
                      &harr;
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-obsidian/80 backdrop-blur-md text-[10px] uppercase font-bold text-stone rounded pointer-events-none">
                    Original
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-gold text-obsidian text-[10px] uppercase font-bold rounded shadow-md pointer-events-none">
                    AI Fitted
                  </div>
                </div>

                {/* Slider Position Range Input */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone">
                    <span>Drag handle or slider to compare drape:</span>
                    <span className="font-bold text-gold">{sliderPosition}% Split</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="w-full accent-gold bg-obsidian"
                  />
                </div>

                {/* Garment Details & Action Buttons */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-editorial text-base font-bold text-ivory">{selectedProduct.name}</p>
                    <p className="text-xs text-gold font-sans font-bold">{formatINR(selectedProduct.pricePaise)}</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleDownloadLook}
                      className="p-3 bg-obsidian border border-white/10 hover:border-gold rounded text-stone hover:text-ivory"
                      title="Download Rendered Look"
                    >
                      <Download size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="p-3 bg-obsidian border border-white/10 hover:border-gold rounded text-stone hover:text-ivory"
                      title="Share Look"
                    >
                      <Share2 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={handleAddProductToCart}
                      className={`flex-1 sm:flex-none px-6 py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        addedBag ? 'bg-emerald-500 text-obsidian' : 'btn-gold shadow-gold'
                      }`}
                    >
                      <ShoppingBag size={14} />
                      <span>{addedBag ? 'Added to Bag' : 'Add Piece to Bag'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] rounded-xl bg-obsidian/40 border border-white/5 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-gold/60">
                  <Sparkles size={28} />
                </div>
                <p className="font-editorial text-lg text-ivory">Awaiting Generation</p>
                <p className="text-xs text-stone max-w-xs">
                  Upload your portrait on the left and select any piece to audition. Your neural outfit render will appear here with an interactive before/after split slider.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
