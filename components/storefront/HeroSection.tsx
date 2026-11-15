'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Box, Compass } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-obsidian">
      {/* Background Editorial Media with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/media/editorial/hero.jpg"
          alt="XEVORAS Editorial Campaign"
          fill
          priority
          className="object-cover object-top opacity-55 scale-105 animate-in zoom-in-95 duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-obsidian/60" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-obsidian/30 to-obsidian" />
      </div>

      {/* Hero Content Canvas */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 flex flex-col items-center">
        {/* Subtle Brand Kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-obsidian/80 border border-gold/40 text-gold text-xs uppercase tracking-[0.25em] font-semibold mb-6 backdrop-blur-md shadow-gold">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span>AUTUMN / WINTER 2026 EDITION</span>
        </div>

        {/* Brand Tagline Display */}
        <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold text-ivory tracking-tight leading-[1.08] max-w-4xl text-balance">
          Quiet by design. <br className="hidden sm:inline" />
          <span className="gold-shimmer italic font-normal">ALWAYS RARE.</span>
        </h1>

        <p className="mt-4 font-hindi text-gold/90 text-lg sm:text-xl tracking-wide">
          हटके हमेशा
        </p>

        <p className="mt-4 text-stone text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-sans text-balance">
          Elevated staples, floor-sweeping column gowns, and weighted shirting engineered for considered living. Seamlessly visualize every silhouette on your 3D digital avatar or with AI Virtual Try-On.
        </p>

        {/* Dual Luxury CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-gold px-8 py-4 rounded text-xs uppercase tracking-widest font-bold shadow-gold hover:shadow-gold-lg"
          >
            <Compass size={16} />
            <span>EXPLORE COLLECTION</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            href="/avatar-studio"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-charcoal/80 hover:bg-charcoal text-ivory border border-white/15 hover:border-gold px-8 py-4 rounded text-xs uppercase tracking-widest font-semibold backdrop-blur-md transition-all group"
          >
            <Box size={16} className="text-gold group-hover:scale-110 transition-transform" />
            <span>TRY YOUR LOOK (3D)</span>
            <Sparkles size={14} className="text-gold" />
          </Link>
        </div>

        {/* Micro Features Strip */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 sm:gap-12 text-center text-xs text-stone font-sans">
          <div>
            <p className="font-editorial text-lg sm:text-xl font-bold text-ivory">100%</p>
            <p className="text-[11px] uppercase tracking-wider text-stone/70 mt-0.5">Weighted Fabrics</p>
          </div>
          <div>
            <p className="font-editorial text-lg sm:text-xl font-bold text-gold">3D</p>
            <p className="text-[11px] uppercase tracking-wider text-stone/70 mt-0.5">Avatar Customizer</p>
          </div>
          <div>
            <p className="font-editorial text-lg sm:text-xl font-bold text-ivory">₹0</p>
            <p className="text-[11px] uppercase tracking-wider text-stone/70 mt-0.5">Shipping All India</p>
          </div>
        </div>
      </div>
    </section>
  );
}
