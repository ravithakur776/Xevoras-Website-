import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { Smartphone, Download, Sparkles, Zap, ShieldCheck, CheckCircle2, Share, PlusSquare, ArrowRight } from 'lucide-react';
import { AppInstallTrigger } from '@/components/pwa/AppInstallTrigger';

export const metadata: Metadata = {
  title: 'XEVORAS Mobile App — 1-Click Install for iOS & Android',
  description: 'Download the official XEVORAS Atelier App directly to your mobile phone. Experience 3D Avatar Try-On, instant one-click orders, and VIP luxury garment drops.',
};

export default function AppPage() {
  return (
    <div className="min-h-screen bg-obsidian py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16 sm:space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold tracking-widest uppercase">
            <Sparkles size={13} />
            <span>Official Mobile App &middot; Always Rare</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-ivory tracking-tight">
            The XEVORAS Atelier <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold">
              In The Palm of Your Hand.
            </span>
          </h1>

          <p className="font-sans text-stone text-sm sm:text-base leading-relaxed">
            Install the official XEVORAS mobile application directly onto your smartphone. Zero storage bloat, instant access, 3D avatar tailoring, and exclusive collections.
          </p>

          {/* Interactive Install CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <AppInstallTrigger />

            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/10 hover:border-gold/50 text-stone hover:text-ivory font-bold text-xs tracking-wider uppercase transition-colors"
            >
              Browse Web Shop First
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-stone/70 pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" /> 1-Click Install
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-gold" /> No App Store Needed
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-gold" /> 100% Free & Secure
            </span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-charcoal border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Zap size={20} />
            </div>
            <h3 className="text-base font-bold text-ivory">Instant High-Speed Shopping</h3>
            <p className="text-xs text-stone leading-relaxed">
              Engineered with advanced Progressive Web technology for sub-second page transitions, instant checkout, and offline garment viewing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Sparkles size={20} />
            </div>
            <h3 className="text-base font-bold text-ivory">3D Avatar Studio & AI Try-On</h3>
            <p className="text-xs text-stone leading-relaxed">
              Fit clothes on a 3D digital model and see real garment drape before placing orders, exclusively tailored for mobile screens.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Smartphone size={20} />
            </div>
            <h3 className="text-base font-bold text-ivory">Home Screen Integration</h3>
            <p className="text-xs text-stone leading-relaxed">
              Launches in full-screen standalone mode without any browser URL bar, complete with the iconic champagne gold XEVORAS emblem.
            </p>
          </div>
        </div>

        {/* How-to Install Guides (Android & iOS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Android Guide */}
          <div className="p-8 rounded-3xl bg-charcoal border border-white/10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div>
                <h3 className="text-lg font-bold text-ivory">Android Installation</h3>
                <p className="text-xs text-stone">Google Chrome, Samsung Internet, Edge, Brave</p>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-stone">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Tap the <strong>"Install XEVORAS App"</strong> button above or in the bottom prompt bar.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>Chrome will pop up a window: <strong>"Install XEVORAS?"</strong>. Tap <strong>Install</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>The app icon will immediately appear on your phone's Home Screen & App Drawer!</span>
              </li>
            </ol>
          </div>

          {/* iPhone / iPad Guide */}
          <div className="p-8 rounded-3xl bg-charcoal border border-white/10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                i
              </div>
              <div>
                <h3 className="text-lg font-bold text-ivory">Apple iOS Installation</h3>
                <p className="text-xs text-stone">Safari on iPhone & iPad</p>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-stone">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Open <strong>xevoras.com</strong> in Safari on your iPhone.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>Tap the <Share size={13} className="inline text-gold mx-1" /> <strong>Share</strong> icon in Safari's bottom toolbar.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>Scroll down and select <PlusSquare size={13} className="inline text-gold mx-1" /> <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong>.</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
