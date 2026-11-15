'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Shield, Truck, RotateCcw, PhoneCall } from 'lucide-react';

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-obsidian-deep text-stone border-t border-white/5 font-sans">
      {/* Brand Trust Strip */}
      <div className="border-b border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gold flex-shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-ivory tracking-wide uppercase">Free Delivery</p>
              <p className="text-[11px] text-stone/60">Across India, zero minimum</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gold flex-shrink-0">
              <RotateCcw size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-ivory tracking-wide uppercase">7-Day Easy Returns</p>
              <p className="text-[11px] text-stone/60">Hassle-free reverse pickups</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gold flex-shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-ivory tracking-wide uppercase">Cash on Delivery</p>
              <p className="text-[11px] text-stone/60">Pay securely at your doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gold flex-shrink-0">
              <PhoneCall size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-ivory tracking-wide uppercase">Studio Care</p>
              <p className="text-[11px] text-stone/60">+91 86796 89174</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
        {/* Brand Column */}
        <div className="md:col-span-4 space-y-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image src="/brand/logo.png" alt="XEVORAS" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-xl font-bold tracking-widest text-ivory group-hover:text-gold transition-colors">
                XEVORAS
              </span>
              <span className="text-[9px] tracking-[0.25em] text-gold uppercase">
                ALWAYS RARE
              </span>
            </div>
          </Link>
          <p className="text-xs text-stone/80 leading-relaxed max-w-sm">
            Modern everyday essentials and fluid festive eveningwear. Crafted in small batches across India for considered living and quiet confidence.
          </p>
          <div className="pt-2 text-xs text-gold/90 flex items-center gap-2">
            <span className="font-hindi text-sm">हटके हमेशा</span>
            <span className="text-stone/40">·</span>
            <span>Mumbai &amp; Surat Workshops</span>
          </div>
        </div>

        {/* Navigation Column 1: Shop */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ivory">Collection</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/women" className="hover:text-gold transition-colors">Women</Link></li>
            <li><Link href="/men" className="hover:text-gold transition-colors">Men</Link></li>
            <li><Link href="/shop?sort=newest" className="hover:text-gold transition-colors">New Arrivals</Link></li>
            <li><Link href="/shop?category=women-dresses" className="hover:text-gold transition-colors">Column Gowns</Link></li>
            <li><Link href="/shop?category=men-shirts" className="hover:text-gold transition-colors">Weighted Shirts</Link></li>
            <li><Link href="/shop?featured=true" className="hover:text-gold transition-colors">The Edit</Link></li>
          </ul>
        </div>

        {/* Navigation Column 2: Fashion-Tech & Studio */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ivory">Fashion-Tech</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/avatar-studio" className="hover:text-gold transition-colors flex items-center gap-1.5">
                <span>3D Avatar Studio</span>
                <span className="text-[8px] px-1 bg-gold/20 text-gold rounded font-bold">3D</span>
              </Link>
            </li>
            <li>
              <Link href="/virtual-try-on" className="hover:text-gold transition-colors flex items-center gap-1.5">
                <span>AI Virtual Try-On</span>
                <span className="text-[8px] px-1 bg-gold/20 text-gold rounded font-bold">AI</span>
              </Link>
            </li>
            <li>
              <Link href="/app" className="hover:text-gold transition-colors flex items-center gap-1.5 text-gold font-bold">
                <span>📲 Mobile App</span>
                <span className="text-[8px] px-1 bg-gold text-obsidian rounded font-bold">INSTALL</span>
              </Link>
            </li>
            <li><Link href="/size-guide" className="hover:text-gold transition-colors">Fit &amp; Size Guide</Link></li>
            <li><Link href="/account" className="hover:text-gold transition-colors">Saved Looks</Link></li>
            <li><Link href="/admin" className="text-stone/40 hover:text-gold transition-colors">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Newsletter & Club Column */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ivory">The XEVORAS Letter</h4>
          <p className="text-xs text-stone/80">
            Curated styling notes, fabric releases, and early access to limited capsule editions. No noise.
          </p>
          {subscribed ? (
            <div className="flex items-center gap-2 p-3 bg-gold/10 border border-gold/30 rounded text-gold text-xs">
              <Check size={16} />
              <span>You are subscribed to the private XEVORAS note.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="bg-charcoal border border-white/10 rounded px-3.5 py-2.5 text-xs text-ivory placeholder-stone/50 focus:outline-none focus:border-gold flex-1"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-gold hover:bg-gold-light text-obsidian rounded transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                aria-label="Subscribe to newsletter"
              >
                <span>Join</span>
                <ArrowRight size={13} />
              </button>
            </form>
          )}
          <p className="text-[11px] text-stone/50 pt-1">
            Compliant with DPDP Act. You may unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-white/5 py-6 text-xs text-stone/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} XEVORAS. All rights reserved. GST-inclusive pricing.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/legal/privacy" className="hover:text-ivory transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/legal/terms" className="hover:text-ivory transition-colors">Terms of Sale</Link>
            <span>·</span>
            <Link href="/legal/shipping" className="hover:text-ivory transition-colors">Shipping Policy</Link>
            <span>·</span>
            <Link href="/legal/returns" className="hover:text-ivory transition-colors">Returns &amp; Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
