'use client';

import React from 'react';
import Link from 'next/link';

export function AnnouncementBar() {
  return (
    <div className="bg-obsidian-deep text-stone text-xs py-2 px-4 border-b border-white/5 tracking-wider font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-3">
          <span className="text-gold tracking-widest font-semibold uppercase text-[10px]">
            ALWAYS RARE
          </span>
          <span className="text-stone/40">·</span>
          <span className="font-hindi text-gold/90 tracking-normal text-xs">हटके हमेशा</span>
        </div>

        <div className="mx-auto md:mx-0 flex items-center gap-2 text-center">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span>Complimentary Express Delivery on All Orders across India · Cash on Delivery Available</span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px] text-stone/80">
          <Link href="/avatar-studio" className="hover:text-gold transition-colors">
            3D Studio
          </Link>
          <span className="text-stone/40">·</span>
          <Link href="/virtual-try-on" className="hover:text-gold transition-colors">
            AI Try-On
          </Link>
        </div>
      </div>
    </div>
  );
}
