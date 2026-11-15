'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Sparkles,
  Box,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { formatINR, calculateDiscount } from '@/lib/utils/format';
import { normalizeImageUrl } from '@/lib/utils/image';
import { useCart } from '@/lib/store/cartContext';
import { useWishlist } from '@/lib/store/wishlistContext';
import { ProductCard } from '@/components/storefront/ProductCard';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);
  const [activeTab, setActiveTab] = useState<'details' | 'material' | 'care'>('details');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const discount = calculateDiscount(product.pricePaise, product.compareAtPricePaise);
  const rawImage = product.images[activeImageIndex]?.url || product.images[0]?.url || '/media/products/women-1.jpg';
  const currentImage = normalizeImageUrl(rawImage);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      sku: selectedVariant.sku,
      size: selectedVariant.size,
      color: selectedVariant.colorName,
      pricePaise: product.pricePaise,
      imageUrl: product.images[0]?.url || '/media/products/women-1.jpg',
      sourcing: product.sourcing || 'own',
      quantity: 1,
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-stone mb-8 font-sans">
        <Link href="/" className="hover:text-gold transition-colors">Home</Link>
        <ChevronRight size={13} className="text-stone/40" />
        <Link href="/shop" className="hover:text-gold transition-colors">Shop</Link>
        <ChevronRight size={13} className="text-stone/40" />
        <Link href={`/shop?category=${product.category}`} className="hover:text-gold transition-colors">
          {product.categoryName}
        </Link>
        <ChevronRight size={13} className="text-stone/40" />
        <span className="text-ivory font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Two-Column PDP Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Gallery Rail (Sticky on desktop) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnail Rail */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[640px] no-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                  activeImageIndex === idx ? 'border-gold shadow-gold' : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={normalizeImageUrl(img.url)} alt={img.alt || product.name} fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>

          {/* Main Stage Image */}
          <div
            className="relative flex-1 aspect-[3/4] rounded-xl overflow-hidden bg-charcoal border border-white/5 cursor-zoom-in group"
            onClick={() => setZoomOpen(true)}
          >
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {discount && (
              <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider bg-clay px-3 py-1 rounded-full text-ivory shadow-lg">
                {discount}% OFF
              </span>
            )}
            <div className="absolute bottom-3 right-3 px-3 py-1 bg-obsidian/80 backdrop-blur-md text-[11px] font-sans text-stone rounded border border-white/10">
              Click to Zoom
            </div>
          </div>
        </div>

        {/* Right: Sticky Details & Purchase Dock */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-white/5 pb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
                {product.categoryName} &middot; {product.gender.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`p-2 rounded-full border transition-all ${
                  isFavorited
                    ? 'border-gold bg-gold text-obsidian'
                    : 'border-white/10 text-stone hover:text-gold hover:border-gold'
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-sans text-2xl font-bold text-ivory">
                {formatINR(product.pricePaise)}
              </span>
              {product.compareAtPricePaise && (
                <span className="font-sans text-sm text-stone/50 line-through">
                  {formatINR(product.compareAtPricePaise)}
                </span>
              )}
              <span className="text-xs text-stone/70">GST Included &middot; Free Delivery</span>
            </div>

            {product.shortDescription && (
              <p className="text-sm text-stone/90 leading-relaxed font-sans pt-2">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Fashion-Tech Launchpad: 3D Avatar & AI Try-On Bar */}
          <div className="p-4 rounded-xl bg-charcoal/60 border border-gold/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Virtual Dressing Room</span>
              </span>
              <span className="text-[10px] text-stone/60 uppercase">Interactive Studio</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href={`/avatar-studio?product=${product.id}`}
                className="flex items-center justify-center gap-2 p-2.5 rounded bg-obsidian border border-white/10 hover:border-gold text-ivory text-xs font-semibold tracking-wider uppercase transition-colors group"
              >
                <Box size={15} className="text-gold group-hover:scale-110 transition-transform" />
                <span>3D Avatar Studio</span>
              </Link>

              <Link
                href={`/virtual-try-on?product=${product.id}`}
                className="flex items-center justify-center gap-2 p-2.5 rounded bg-obsidian border border-white/10 hover:border-gold text-ivory text-xs font-semibold tracking-wider uppercase transition-colors group"
              >
                <Sparkles size={15} className="text-gold group-hover:scale-110 transition-transform" />
                <span>AI Photo Try-On</span>
              </Link>
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider text-stone font-bold">
                Size: <strong className="text-ivory">{selectedVariant?.size || 'Select'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-gold hover:underline flex items-center gap-1 font-sans"
              >
                <Ruler size={13} />
                <span>Size Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.sku === v.sku;
                const isOutOfStock = v.stock <= 0;
                return (
                  <button
                    key={v.sku}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setSelectedVariant(v)}
                    className={`py-3 rounded font-semibold text-xs transition-all border ${
                      isSelected
                        ? 'border-gold bg-gold text-obsidian shadow-gold font-bold'
                        : isOutOfStock
                        ? 'border-white/5 text-stone/30 line-through cursor-not-allowed bg-obsidian/40'
                        : 'border-white/10 bg-charcoal text-ivory hover:border-white/30'
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>

            {selectedVariant && (
              <p className="text-[11px] text-stone/70">
                {selectedVariant.stock > 3 ? (
                  <span className="text-emerald-400">● In Stock for Immediate Dispatch</span>
                ) : selectedVariant.stock > 0 ? (
                  <span className="text-amber-400">● Only {selectedVariant.stock} pieces remaining</span>
                ) : (
                  <span className="text-red-400">● Out of stock</span>
                )}
              </p>
            )}
          </div>

          {/* Action Buttons: Add to Bag & Buy Now */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock <= 0}
              className={`w-full py-4 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                addedAnimation
                  ? 'bg-emerald-500 text-obsidian'
                  : 'btn-gold shadow-gold hover:shadow-gold-lg'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check size={16} />
                  <span>Added to Shopping Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Add to Shopping Bag</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!selectedVariant || selectedVariant.stock <= 0}
              className="w-full py-4 rounded text-xs font-bold uppercase tracking-widest bg-charcoal hover:bg-charcoal-elevated text-ivory border border-white/15 hover:border-gold transition-colors"
            >
              Instant Buy Now &middot; {formatINR(product.pricePaise)}
            </button>
          </div>

          {/* Shipping & Assurance Strip */}
          <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-stone font-sans">
            <div className="flex items-center gap-3">
              <Truck size={16} className="text-gold" />
              <span>Free express shipping &middot; Dispatches in 24 hours</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={16} className="text-gold" />
              <span>Easy 7-day doorstep return and exchange guarantee</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-gold" />
              <span>Cash on Delivery &amp; UPI available at checkout</span>
            </div>
          </div>

          {/* Tabs: Details, Fabric & Material, Care */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="flex border-b border-white/10 gap-6 text-xs uppercase tracking-wider font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`pb-2 transition-colors relative ${
                  activeTab === 'details' ? 'text-gold' : 'text-stone hover:text-ivory'
                }`}
              >
                <span>Description</span>
                {activeTab === 'details' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gold" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('material')}
                className={`pb-2 transition-colors relative ${
                  activeTab === 'material' ? 'text-gold' : 'text-stone hover:text-ivory'
                }`}
              >
                <span>Fabric &amp; Fit</span>
                {activeTab === 'material' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gold" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('care')}
                className={`pb-2 transition-colors relative ${
                  activeTab === 'care' ? 'text-gold' : 'text-stone hover:text-ivory'
                }`}
              >
                <span>Garment Care</span>
                {activeTab === 'care' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gold" />}
              </button>
            </div>

            <div className="text-xs text-stone/80 leading-relaxed font-sans min-h-[80px]">
              {activeTab === 'details' && <p>{product.description}</p>}
              {activeTab === 'material' && (
                <div className="space-y-2">
                  <p><strong>Composition:</strong> {product.material || 'Premium blended natural weave'}</p>
                  <p><strong>Fit Profile:</strong> {product.fit || 'Tailored contemporary silhouette'}</p>
                  <p><strong>Pattern:</strong> {product.pattern || 'Solid architectural cut'}</p>
                </div>
              )}
              {activeTab === 'care' && (
                <p>{product.care || 'Gentle dry clean recommended. Store hung in breathable garment bag. Steam iron at medium heat.'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="mt-28 border-t border-white/5 pt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
                CONSIDERED PAIRINGS
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-ivory mt-1">
                Complete The Look
              </h2>
            </div>
            <Link href="/shop" className="text-xs uppercase tracking-wider text-stone hover:text-gold font-semibold">
              View All Pieces &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Interactive Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-charcoal border border-white/10 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-editorial text-xl font-bold text-ivory">Garment Size Specifications</h3>
              <button type="button" onClick={() => setSizeGuideOpen(false)} className="text-stone hover:text-ivory">
                ✕
              </button>
            </div>
            <p className="text-xs text-stone">
              Measurements reflect garment dimensions. We recommend choosing your standard tailored size.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gold uppercase tracking-wider">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest / Bust (in)</th>
                    <th className="py-2">Waist (in)</th>
                    <th className="py-2">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-stone font-sans">
                  <tr><td className="py-2 font-bold text-ivory">XS</td><td>34 - 36</td><td>26 - 28</td><td>52</td></tr>
                  <tr><td className="py-2 font-bold text-ivory">S</td><td>36 - 38</td><td>28 - 30</td><td>53</td></tr>
                  <tr><td className="py-2 font-bold text-ivory">M</td><td>38 - 40</td><td>30 - 32</td><td>54</td></tr>
                  <tr><td className="py-2 font-bold text-ivory">L</td><td>40 - 42</td><td>32 - 34</td><td>55</td></tr>
                  <tr><td className="py-2 font-bold text-ivory">XL</td><td>42 - 44</td><td>34 - 36</td><td>56</td></tr>
                  <tr><td className="py-2 font-bold text-ivory">XXL</td><td>44 - 46</td><td>36 - 38</td><td>57</td></tr>
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              className="w-full py-2.5 btn-gold rounded text-xs font-bold uppercase tracking-wider mt-4"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* High-Resolution Zoom Modal */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg cursor-zoom-out"
          onClick={() => setZoomOpen(false)}
        >
          <div className="relative w-full max-w-4xl h-[85vh]">
            <Image src={currentImage} alt={product.name} fill className="object-contain" priority />
          </div>
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute top-6 right-6 text-ivory bg-charcoal p-2 rounded-full border border-white/20"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
