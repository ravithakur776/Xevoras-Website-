import React from 'react';
import Link from 'next/link';
import { HeroSection } from '@/components/storefront/HeroSection';
import { CategoryChipStrip } from '@/components/storefront/CategoryChipStrip';
import { ProductCard } from '@/components/storefront/ProductCard';
import {
  GenderEditorialPortals,
  AvatarStudioTeaser,
  VirtualTryOnTeaser,
  BrandStory,
} from '@/components/storefront/FeatureBanners';
import { CustomerReviews, InstagramSocialGrid } from '@/components/storefront/CustomerReviews';
import { CatalogService } from '@/lib/services/catalog.service';
import { ArrowRight, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const trendingPieces = await CatalogService.getLiveTrendingProducts(4);
  const newArrivals = await CatalogService.getLiveNewArrivals(4);
  const featuredEdit = await CatalogService.getLiveFeaturedProducts(4);

  return (
    <div className="space-y-0">
      {/* 1. Cinematic Hero */}
      <HeroSection />

      {/* 2. Featured Category Chip Strip */}
      <CategoryChipStrip />

      {/* 3. The XEVORAS Edit (Curated Styling) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10 pb-4 border-b border-white/5 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
                CURATED SELECTION
              </span>
              <Sparkles size={13} className="text-gold" />
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">
              The XEVORAS Edit
            </h2>
          </div>
          <Link
            href="/shop?featured=true"
            className="group flex items-center gap-1.5 text-xs uppercase tracking-widest text-stone hover:text-gold transition-colors font-semibold"
          >
            <span>View All Curated Pieces</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredEdit.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Gender Portals (Women / Men) */}
      <GenderEditorialPortals />

      {/* 5. Trending Pieces */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10 pb-4 border-b border-white/5 gap-2">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
              IN DEMAND
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">
              Trending Pieces
            </h2>
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-1.5 text-xs uppercase tracking-widest text-stone hover:text-gold transition-colors font-semibold"
          >
            <span>View Entire Catalogue</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {trendingPieces.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Signature Feature: 3D Avatar Studio Intro */}
      <AvatarStudioTeaser />

      {/* 7. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10 pb-4 border-b border-white/5 gap-2">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
              JUST RELEASED
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="group flex items-center gap-1.5 text-xs uppercase tracking-widest text-stone hover:text-gold transition-colors font-semibold"
          >
            <span>Shop New In</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. Signature Feature: AI Virtual Try-On Intro */}
      <VirtualTryOnTeaser />

      {/* 9. Brand Story */}
      <BrandStory />

      {/* 10. Customer Reviews */}
      <CustomerReviews />

      {/* 11. Instagram Social Diary */}
      <InstagramSocialGrid />
    </div>
  );
}
