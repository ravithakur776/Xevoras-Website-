'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import { INITIAL_PRODUCTS } from '@/lib/data/initialCatalog';
import { formatINR } from '@/lib/utils/format';
import Image from 'next/image';
import Link from 'next/link';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProducts = query.trim().length > 1
    ? INITIAL_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(query.toLowerCase()) ||
          (p.keywords && p.keywords.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const quickSearches = ['Column Gown', 'Weighted Shirt', 'Rigid Straight Jeans', 'Trench Coat', 'Co-ords'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative w-full max-w-2xl bg-charcoal border border-white/10 rounded-lg shadow-2xl p-6 z-10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3">
            <Search size={22} className="text-gold" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search silk gowns, linen shirts, denim, trench coats..."
              className="w-full bg-transparent text-ivory placeholder-stone/60 text-base sm:text-lg focus:outline-none"
              autoFocus
            />
          </form>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone hover:text-ivory rounded"
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

        {/* Popular Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-stone/60 font-sans">Popular:</span>
          {quickSearches.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag);
              }}
              className="text-xs px-2.5 py-1 bg-white/5 hover:bg-gold/15 hover:text-gold border border-white/10 rounded-full text-stone transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Live Matching Results */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 border-t border-white/5 pt-4">
            <p className="text-xs uppercase tracking-widest text-gold font-sans font-semibold mb-3">
              Matching Pieces
            </p>
            <div className="space-y-2">
              {filteredProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-14 bg-obsidian rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={p.images[0]?.url || '/media/products/women-1.jpg'}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ivory group-hover:text-gold transition-colors font-sans">
                        {p.name}
                      </p>
                      <p className="text-xs text-stone">{p.categoryName} · {p.gender}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ivory">
                      {formatINR(p.pricePaise)}
                    </span>
                    <ArrowRight size={15} className="text-stone group-hover:text-gold group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {query.trim().length > 1 && filteredProducts.length === 0 && (
          <div className="mt-8 text-center py-6 text-stone text-sm">
            No matching pieces found for &ldquo;{query}&rdquo;. Try another fabric or category keyword.
          </div>
        )}
      </div>
    </div>
  );
}
