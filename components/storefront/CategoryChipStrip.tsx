'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { INITIAL_CATEGORIES } from '@/lib/data/initialCatalog';

export function CategoryChipStrip() {
  const chips = [
    { label: 'Women', href: '/women', image: '/media/editorial/women-story.jpg' },
    { label: 'Men', href: '/men', image: '/media/editorial/men-story.jpg' },
    ...INITIAL_CATEGORIES.map((c) => ({
      label: c.name,
      href: `/shop?category=${c.slug}`,
      image: c.image || '/media/products/women-1.jpg',
    })),
  ];

  return (
    <div className="bg-charcoal/40 border-y border-white/5 py-4 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-3 sm:space-x-4 min-w-max">
        {chips.map((chip, idx) => (
          <Link
            key={idx}
            href={chip.href}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-charcoal border border-white/10 hover:border-gold/50 hover:bg-obsidian transition-all group"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden bg-obsidian flex-shrink-0 border border-white/10">
              <Image src={chip.image} alt={chip.label} fill className="object-cover" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone group-hover:text-gold transition-colors font-sans">
              {chip.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
