'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Box, Sparkles, CheckCircle2, Shield, Eye, Layers } from 'lucide-react';

export function GenderEditorialPortals() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Women's Portal */}
        <Link
          href="/women"
          className="group relative h-[440px] sm:h-[520px] rounded-xl overflow-hidden border border-white/5 shadow-2xl flex flex-col justify-end p-8 sm:p-10"
        >
          <Image
            src="/media/editorial/women-story.jpg"
            alt="Women's Collection"
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
          
          <div className="relative z-10 space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
              Festive &amp; Contemporary
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory group-hover:text-gold transition-colors">
              Women’s Edit
            </h2>
            <p className="text-xs sm:text-sm text-stone/90 max-w-md">
              Fluid viscose column gowns, tailored flared trousers and architectural coordinated sets designed to move effortlessly.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ivory group-hover:text-gold transition-colors">
              <span>Explore Women</span>
              <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Men's Portal */}
        <Link
          href="/men"
          className="group relative h-[440px] sm:h-[520px] rounded-xl overflow-hidden border border-white/5 shadow-2xl flex flex-col justify-end p-8 sm:p-10"
        >
          <Image
            src="/media/editorial/men-story.jpg"
            alt="Men's Collection"
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
          
          <div className="relative z-10 space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
              Structured &amp; Relaxed
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory group-hover:text-gold transition-colors">
              Men’s Edit
            </h2>
            <p className="text-xs sm:text-sm text-stone/90 max-w-md">
              High-GSM weighted cotton tees, Japanese-cut rigid straight denim and structured overshirts built for everyday endurance.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ivory group-hover:text-gold transition-colors">
              <span>Explore Men</span>
              <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

export function AvatarStudioTeaser() {
  return (
    <section className="bg-charcoal/40 border-y border-white/5 py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Showcase */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-xl bg-obsidian-deep border border-gold/20 overflow-hidden shadow-gold flex items-center justify-center p-6 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-transparent" />
            {/* Mannequin Studio Graphic */}
            <div className="relative z-10 text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                <Box size={44} />
              </div>
              <div className="inline-block px-3 py-1 bg-obsidian/80 border border-gold/30 rounded-full text-[10px] font-bold tracking-widest text-gold uppercase">
                WEBGL 3D INTERACTIVE CANVAS
              </div>
              <h3 className="font-editorial text-2xl font-bold text-ivory">
                The XEVORAS Avatar Studio
              </h3>
              <p className="text-xs text-stone max-w-xs mx-auto">
                Select your silhouette, adjust proportions, rotate 360°, and audition wardrobe pieces in real time.
              </p>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-stone/60 font-sans px-4 py-2 bg-charcoal/80 rounded border border-white/10 backdrop-blur-sm">
              <span>Touch &amp; Drag Rotation</span>
              <span className="text-gold">360° Orbit View</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-gold">
              <Box size={15} />
              <span>SIGNATURE INNOVATION</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-ivory leading-tight text-balance">
              Experience Your Wardrobe in Full 3D Space.
            </h2>

            <p className="text-stone text-sm sm:text-base leading-relaxed font-sans">
              No more guessing how a column gown falls or how structured shirting sits across the shoulders. The XEVORAS 3D Studio lets you configure realistic body presets, audition garments from every angle, and seamlessly save your signature looks.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-stone font-sans">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Custom silhouette and skin tone controls</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-gold flex-shrink-0 mt-0.5" />
                <span>360° dynamic camera with smooth orbit</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Multi-garment pairing and color changes</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-gold flex-shrink-0 mt-0.5" />
                <span>1-click bundle to shopping bag</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/avatar-studio"
                className="inline-flex items-center gap-2 btn-gold px-8 py-3.5 rounded text-xs uppercase tracking-widest font-bold shadow-gold"
              >
                <span>Launch Avatar Studio</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VirtualTryOnTeaser() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Text */}
        <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-gold">
            <Sparkles size={15} />
            <span>AI VISION INTELLIGENCE</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-ivory leading-tight text-balance">
            See the Fit On Yourself Before You Order.
          </h2>

          <p className="text-stone text-sm sm:text-base leading-relaxed font-sans">
            Powered by enterprise-grade neural vision processing. Upload a simple standing photo, pick any piece from our collection, and generate a photorealistic outfit preview in seconds.
          </p>

          <div className="space-y-3 pt-2 text-xs text-stone font-sans">
            <div className="flex items-center gap-2.5 p-3 rounded bg-white/5 border border-white/5">
              <Shield size={16} className="text-gold flex-shrink-0" />
              <span><strong>Privacy Shield Guaranteed:</strong> Private uploads, ephemeral processing, zero AI model training on customer images.</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded bg-white/5 border border-white/5">
              <Layers size={16} className="text-gold flex-shrink-0" />
              <span><strong>Side-by-Side Comparison:</strong> Interactive Before &amp; After split slider to review drape and proportions.</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/virtual-try-on"
              className="inline-flex items-center gap-2 bg-charcoal hover:bg-obsidian-surface text-ivory border border-gold/40 hover:border-gold px-8 py-3.5 rounded text-xs uppercase tracking-widest font-bold transition-all group"
            >
              <Sparkles size={15} className="text-gold group-hover:scale-110 transition-transform" />
              <span>Try With Your Photo</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Right: Visual Card */}
        <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-xl bg-charcoal border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-6 order-1 lg:order-2 group">
          <Image
            src="/media/editorial/hero.jpg"
            alt="AI Try-On Demo"
            fill
            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
          
          <div className="relative z-10 text-center space-y-3 p-6 bg-obsidian/80 backdrop-blur-md rounded-lg border border-white/10 max-w-sm">
            <div className="flex items-center justify-center gap-3">
              <div className="px-2.5 py-1 bg-white/10 text-stone text-[10px] uppercase font-bold rounded">
                Original
              </div>
              <ArrowRight size={14} className="text-gold" />
              <div className="px-2.5 py-1 bg-gold text-obsidian text-[10px] uppercase font-bold rounded">
                AI Fitted
              </div>
            </div>
            <p className="font-editorial text-lg font-bold text-ivory">
              Neural Garment Simulation
            </p>
            <p className="text-[11px] text-stone font-sans">
              Instant realistic fabric drape, lighting alignment, and silhouette adaptation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BrandStory() {
  return (
    <section className="bg-obsidian-deep border-t border-white/5 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">
          OUR ETHOS
        </span>
        <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-ivory leading-tight">
          Crafted for Real Presence, Not Fleeting Noise.
        </h2>
        <p className="font-hindi text-xl text-gold/90">
          हटके हमेशा — Always Rare
        </p>
        <p className="text-stone text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
          XEVORAS was born out of an appreciation for quiet craftsmanship. We don’t chase volatile weekly trends. Instead, we produce in small, considered batches through master workshops in Mumbai and Surat—using weighted natural fibers, precise stitching, and architectural draping that stands the test of seasons.
        </p>
        <div className="pt-4 flex items-center justify-center gap-8 text-xs text-stone/80 font-sans">
          <span>Small Batch Production</span>
          <span>·</span>
          <span>Zero Overproduction Waste</span>
          <span>·</span>
          <span>GST-Inclusive Pricing</span>
        </div>
      </div>
    </section>
  );
}
