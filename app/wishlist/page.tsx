'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/lib/store/wishlistContext';
import { INITIAL_PRODUCTS } from '@/lib/data/initialCatalog';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const wishlistedProducts = INITIAL_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="pb-6 border-b border-white/5 mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
          SAVED CURATION
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">
          Your Wishlist ({wishlistedProducts.length} Pieces)
        </h1>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="py-24 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-charcoal border border-white/10 mx-auto flex items-center justify-center text-stone/40">
            <Heart size={28} />
          </div>
          <p className="font-editorial text-2xl text-ivory">Your Wishlist is Empty</p>
          <p className="text-xs text-stone">
            Tap the heart on any piece across our collection to save your personal wardrobe selection.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 btn-gold px-7 py-3 rounded text-xs uppercase tracking-wider font-bold shadow-gold"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
