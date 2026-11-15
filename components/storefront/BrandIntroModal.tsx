'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export function BrandIntroModal() {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Only show once per session
    const seen = sessionStorage.getItem('xevoras_brand_intro_seen');
    if (!seen) {
      setVisible(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setFadingOut(true);
    setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem('xevoras_brand_intro_seen', 'true');
      } catch {
        // Safe fallback
      }
    }, 600);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-obsidian cursor-pointer select-none transition-all duration-700 ease-out ${
        fadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to XEVORAS"
    >
      <div className="relative flex flex-col items-center space-y-6 text-center px-4 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-2xl border border-gold/30">
          <Image
            src="/brand/xevoras-emblem-gold.jpg"
            alt="XEVORAS Luxury Emblem"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="space-y-2">
          <span className="block font-editorial text-4xl sm:text-5xl font-bold tracking-[0.2em] text-ivory">
            XEVORAS
          </span>
          <span className="block text-xs uppercase tracking-[0.35em] text-gold font-bold">
            ALWAYS RARE
          </span>
          <span className="block font-hindi text-stone text-sm tracking-widest pt-1">
            हटके हमेशा
          </span>
        </div>

        <p className="text-[10px] uppercase tracking-widest text-stone/40 pt-4">
          Click anywhere or wait to enter atelier
        </p>
      </div>
    </div>
  );
}
