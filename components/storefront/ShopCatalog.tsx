'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/storefront/ProductCard';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/data/initialCatalog';
import { Product } from '@/lib/types';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';

interface ShopCatalogProps {
  initialGender?: 'women' | 'men' | 'all';
  initialCategory?: string;
  initialTitle?: string;
  initialProducts?: Product[];
}

export function ShopCatalog({
  initialGender = 'all',
  initialCategory,
  initialTitle = 'The Collection',
  initialProducts,
}: ShopCatalogProps) {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlSort = searchParams.get('sort');
  const urlFeatured = searchParams.get('featured');
  const urlSearch = searchParams.get('search');

  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [gender, setGender] = useState<string>(initialGender);
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory || initialCategory || 'all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sort, setSort] = useState<string>(urlSort || (urlFeatured ? 'featured' : 'newest'));
  const [maxPrice, setMaxPrice] = useState<number>(1000000); // Up to ₹10,000
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync with live database catalog in real time
  useEffect(() => {
    async function fetchLiveProducts() {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products)) {
            setProducts(data.products);
          }
        }
      } catch {
        // Fallback to initialProducts if network fails
      }
    }
    fetchLiveProducts();
  }, []);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (gender !== 'all') {
      list = list.filter((p) => p.gender === gender || p.gender === 'unisex');
    }

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory || p.category.includes(selectedCategory));
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) =>
        p.variants.some((v) => selectedSizes.includes(v.size) && v.stock > 0)
      );
    }

    if (maxPrice < 1000000) {
      list = list.filter((p) => p.pricePaise <= maxPrice);
    }

    if (urlSearch && urlSearch.trim().length > 0) {
      const q = urlSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }

    if (sort === 'price_asc') {
      list.sort((a, b) => a.pricePaise - b.pricePaise);
    } else if (sort === 'price_desc') {
      list.sort((a, b) => b.pricePaise - a.pricePaise);
    } else if (sort === 'newest') {
      list.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    } else if (sort === 'featured') {
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [gender, selectedCategory, selectedSizes, maxPrice, sort, urlSearch]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setGender('all');
    setSelectedCategory('all');
    setSelectedSizes([]);
    setMaxPrice(1000000);
    setSort('newest');
  };

  const hasActiveFilters =
    gender !== 'all' || selectedCategory !== 'all' || selectedSizes.length > 0 || maxPrice < 1000000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title & Breadcrumb Header */}
      <div className="flex flex-col md:flex-row items-baseline justify-between pb-8 border-b border-white/5 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            CATALOGUE &middot; {filteredProducts.length} PIECES
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-ivory mt-1">
            {initialTitle}
          </h1>
        </div>

        {/* Top Controls: Mobile Filter Toggle & Sort Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-charcoal border border-white/10 rounded text-xs font-semibold uppercase tracking-wider text-stone"
          >
            <SlidersHorizontal size={14} className="text-gold" />
            <span>Filters ({selectedSizes.length + (gender !== 'all' ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0)})</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone/60 uppercase tracking-wider hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-charcoal border border-white/10 text-ivory px-3 py-2 rounded focus:outline-none focus:border-gold font-sans text-xs"
            >
              <option value="newest">Newest Additions</option>
              <option value="featured">The Edit (Featured)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills Strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 py-4 border-b border-white/5">
          <span className="text-xs text-stone/60 font-sans">Active:</span>
          {gender !== 'all' && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-white/5 text-ivory border border-white/10 rounded-full font-sans">
              <span className="capitalize">{gender}</span>
              <button type="button" onClick={() => setGender('all')}><X size={12} /></button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-white/5 text-ivory border border-white/10 rounded-full font-sans">
              <span>{INITIAL_CATEGORIES.find((c) => c.slug === selectedCategory)?.name || selectedCategory}</span>
              <button type="button" onClick={() => setSelectedCategory('all')}><X size={12} /></button>
            </span>
          )}
          {selectedSizes.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-white/5 text-ivory border border-white/10 rounded-full font-sans">
              <span>Size {s}</span>
              <button type="button" onClick={() => toggleSize(s)}><X size={12} /></button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-gold hover:underline flex items-center gap-1 font-sans ml-2"
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Main Grid Layout: Desktop Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block md:col-span-3 space-y-8 pr-4">
          {/* Gender */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gold font-bold">Gender</h3>
            <div className="flex flex-col space-y-2 text-xs">
              {['all', 'women', 'men'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`text-left py-1 capitalize transition-colors ${
                    gender === g ? 'text-gold font-bold' : 'text-stone hover:text-ivory'
                  }`}
                >
                  {g === 'all' ? 'All Pieces' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3 border-t border-white/5 pt-6">
            <h3 className="text-xs uppercase tracking-widest text-gold font-bold">Category</h3>
            <div className="flex flex-col space-y-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`text-left py-1 transition-colors ${
                  selectedCategory === 'all' ? 'text-gold font-bold' : 'text-stone hover:text-ivory'
                }`}
              >
                All Categories
              </button>
              {INITIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-left py-1 transition-colors ${
                    selectedCategory === cat.slug ? 'text-gold font-bold' : 'text-stone hover:text-ivory'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3 border-t border-white/5 pt-6">
            <h3 className="text-xs uppercase tracking-widest text-gold font-bold">Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((s) => {
                const active = selectedSizes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`text-xs py-2 rounded font-semibold border transition-all ${
                      active
                        ? 'border-gold bg-gold text-obsidian'
                        : 'border-white/10 bg-charcoal/60 text-stone hover:border-white/30 hover:text-ivory'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3 border-t border-white/5 pt-6">
            <div className="flex justify-between items-center text-xs">
              <h3 className="uppercase tracking-widest text-gold font-bold">Max Price</h3>
              <span className="font-sans font-bold text-ivory">₹{(maxPrice / 100).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="100000"
              max="1000000"
              step="50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-gold bg-charcoal"
            />
            <div className="flex justify-between text-[10px] text-stone/50 font-sans">
              <span>₹1,000</span>
              <span>₹10,000</span>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center space-y-4 bg-charcoal/30 rounded-xl border border-white/5">
              <p className="font-editorial text-2xl text-ivory">No pieces found</p>
              <p className="text-xs text-stone max-w-sm mx-auto">
                No garments matched the selected criteria. Try resetting your size or price range filter.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2.5 btn-gold rounded text-xs uppercase tracking-wider font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-charcoal h-full p-6 overflow-y-auto space-y-6 shadow-2xl z-10 border-l border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-editorial text-lg font-bold text-ivory">Refine Collection</span>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="p-1 text-stone">
                <X size={20} />
              </button>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-gold">Gender</p>
              <div className="flex gap-2">
                {['all', 'women', 'men'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2 text-xs font-semibold rounded capitalize border ${
                      gender === g ? 'bg-gold text-obsidian border-gold' : 'border-white/10 text-stone'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-gold">Sizes</p>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`py-2 text-xs font-semibold rounded border ${
                      selectedSizes.includes(s) ? 'bg-gold text-obsidian border-gold' : 'border-white/10 text-stone'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full py-3 btn-gold rounded text-xs font-bold uppercase tracking-wider mt-6"
            >
              Apply Filters ({filteredProducts.length} pieces)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
