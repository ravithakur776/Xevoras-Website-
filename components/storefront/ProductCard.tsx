'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Sparkles, Box, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatINR, calculateDiscount } from '@/lib/utils/format';
import { normalizeImageUrl } from '@/lib/utils/image';
import { useWishlist } from '@/lib/store/wishlistContext';
import { useCart } from '@/lib/store/cartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const discount = calculateDiscount(product.pricePaise, product.compareAtPricePaise);
  const primaryImg = normalizeImageUrl(product.images[0]?.url || '/media/products/women-1.jpg');
  const hoverImg = product.images[1]?.url ? normalizeImageUrl(product.images[1].url) : primaryImg;

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const variant = product.variants.find((v) => v.size === size) || product.variants[0];
    if (variant) {
      addItem({
        productId: product.id,
        productName: product.name,
        slug: product.slug,
        sku: variant.sku,
        size: variant.size,
        color: variant.colorName,
        pricePaise: product.pricePaise,
        imageUrl: primaryImg,
        sourcing: product.sourcing || 'own',
      });
      setJustAdded(true);
      setShowSizePicker(false);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  return (
    <div
      className="group relative flex flex-col bg-charcoal/50 rounded-lg overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowSizePicker(false);
      }}
    >
      {/* Product Image Area */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-obsidian block">
        <Image
          src={isHovered ? hoverImg : primaryImg}
          alt={product.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="text-[9px] font-bold tracking-widest uppercase bg-obsidian/90 text-gold border border-gold/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
              The Edit
            </span>
          )}
          {discount && (
            <span className="text-[9px] font-bold tracking-wider uppercase bg-clay/90 text-ivory px-2 py-0.5 rounded-full backdrop-blur-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isFavorited
              ? 'bg-gold text-obsidian'
              : 'bg-obsidian/60 text-stone hover:text-gold hover:bg-obsidian/90'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>

        {/* Fashion-Tech Quick Launch Actions */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 gap-1.5">
          <Link
            href={`/avatar-studio?product=${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-obsidian/85 hover:bg-gold hover:text-obsidian text-stone border border-white/10 px-2 py-1.5 rounded backdrop-blur-md transition-colors"
            title="Try on 3D Avatar"
          >
            <Box size={12} />
            <span>3D Avatar</span>
          </Link>
          <Link
            href={`/virtual-try-on?product=${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-obsidian/85 hover:bg-gold hover:text-obsidian text-stone border border-white/10 px-2 py-1.5 rounded backdrop-blur-md transition-colors"
            title="AI Virtual Try-On"
          >
            <Sparkles size={12} />
            <span>AI Try-On</span>
          </Link>
        </div>

        {/* Quick Size Select Drawer */}
        {showSizePicker && (
          <div
            className="absolute inset-x-0 bottom-0 p-3 bg-obsidian/95 backdrop-blur-md border-t border-white/10 z-20 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone mb-2 text-center">
              Select Size
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {product.variants.map((v) => (
                <button
                  key={v.sku}
                  type="button"
                  disabled={v.stock <= 0}
                  onClick={(e) => handleQuickAdd(v.size, e)}
                  className={`text-xs py-1.5 rounded font-semibold transition-colors border ${
                    v.stock > 0
                      ? 'border-white/10 hover:border-gold hover:bg-gold hover:text-obsidian text-ivory'
                      : 'border-white/5 text-stone/30 line-through cursor-not-allowed'
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        )}
      </Link>

      {/* Meta Area */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone/70 font-sans">
            {product.categoryName}
          </p>
          <Link
            href={`/product/${product.slug}`}
            className="font-editorial text-sm sm:text-base font-semibold text-ivory group-hover:text-gold transition-colors line-clamp-1 mt-0.5"
          >
            {product.name}
          </Link>
          {product.material && (
            <p className="text-[11px] text-stone/60 line-clamp-1 mt-1">
              {product.material}
            </p>
          )}
        </div>

        <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-sm sm:text-base font-bold text-ivory">
              {formatINR(product.pricePaise)}
            </span>
            {product.compareAtPricePaise && (
              <span className="font-sans text-xs text-stone/50 line-through">
                {formatINR(product.compareAtPricePaise)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowSizePicker(!showSizePicker);
            }}
            className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
              justAdded
                ? 'bg-emerald-500 text-obsidian'
                : 'bg-white/5 hover:bg-gold hover:text-obsidian text-stone border border-white/10'
            }`}
          >
            {justAdded ? <Check size={14} className="inline" /> : '+ Quick Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
