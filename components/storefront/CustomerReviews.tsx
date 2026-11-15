'use client';

import React from 'react';
import Image from 'next/image';
import { Star, ShieldCheck, Instagram } from 'lucide-react';

export function CustomerReviews() {
  const reviews = [
    {
      author: 'Ananya Singhania',
      city: 'Mumbai',
      piece: 'The Column Gown',
      rating: 5,
      date: 'October 2026',
      comment:
        'The drape of the viscose blend is extraordinary. It feels weighted, fluid, and moves with incredible grace. Wore it to a gallery opening in Colaba and received endless compliments.',
    },
    {
      author: 'Devendra Nair',
      city: 'Bengaluru',
      piece: 'Weighted Cotton Overshirt',
      rating: 5,
      date: 'November 2026',
      comment:
        'Finally a brand in India that understands fabric weight. The collar stays crisp and the stitching is immaculate. The 3D avatar preview matched the actual fit completely.',
    },
    {
      author: 'Meera Kapoor',
      city: 'New Delhi',
      piece: 'Pleated Flared Trousers',
      rating: 5,
      date: 'October 2026',
      comment:
        'Tailored perfection. Zero alterations needed. Delivered in 2 days to Delhi with pristine packaging. You can feel the small-batch quality in every seam.',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center space-y-2 mb-12">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
          COMMUNITY REFLECTIONS
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory">
          Worn &amp; Revered Across India
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="p-8 rounded-xl bg-charcoal/60 border border-white/5 space-y-4 flex flex-col justify-between hover:border-gold/30 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-gold">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-stone text-xs sm:text-sm leading-relaxed italic font-serif">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-ivory font-sans">{rev.author}</p>
                <p className="text-[11px] text-stone/60">{rev.city} · Verified Purchase</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-gold font-semibold bg-gold/10 px-2 py-0.5 rounded">
                {rev.piece}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function InstagramSocialGrid() {
  const posts = [
    { image: '/media/products/women-1.jpg', tag: '@xevoras.studio' },
    { image: '/media/products/men-2.jpg', tag: '@xevoras.studio' },
    { image: '/media/products/women-3.jpg', tag: '@xevoras.studio' },
    { image: '/media/products/men-4.jpg', tag: '@xevoras.studio' },
    { image: '/media/products/women-5.jpg', tag: '@xevoras.studio' },
    { image: '/media/products/jacket-1.jpg', tag: '@xevoras.studio' },
  ];

  return (
    <section className="border-t border-white/5 py-16 bg-charcoal/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
              THE VISUAL DIARY
            </span>
            <h3 className="font-editorial text-2xl font-bold text-ivory mt-0.5">
              Follow @xevoras.studio
            </h3>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:text-gold border border-white/10 hover:border-gold px-4 py-2 rounded transition-all"
          >
            <Instagram size={14} />
            <span>Join The Narrative</span>
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {posts.map((post, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded overflow-hidden bg-obsidian border border-white/5"
            >
              <Image
                src={post.image}
                alt="Instagram Studio Post"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                <Instagram size={20} className="text-gold" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
