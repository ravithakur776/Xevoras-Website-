'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/store/cartContext';
import { formatINR } from '@/lib/utils/format';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotalPaise } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-charcoal border-l border-white/10 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-editorial text-xl font-bold text-ivory tracking-wider">
                Shopping Bag
              </span>
              <span className="text-xs text-gold font-sans px-2 py-0.5 bg-gold/15 rounded-full border border-gold/30">
                {items.reduce((s, i) => s + i.quantity, 0)} {items.length === 1 ? 'Piece' : 'Pieces'}
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 text-stone hover:text-ivory transition-colors"
              aria-label="Close bag"
            >
              <X size={20} />
            </button>
          </div>

          {/* Complimentary Delivery Banner */}
          <div className="bg-obsidian-surface px-6 py-2.5 border-b border-white/5 flex items-center gap-2 text-xs text-stone">
            <Sparkles size={14} className="text-gold flex-shrink-0" />
            <span>Complimentary all-India delivery included on this order.</span>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-white/5">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-stone/40">
                  <span className="font-editorial text-2xl text-gold/40">XV</span>
                </div>
                <p className="font-editorial text-lg text-ivory">Your bag is empty</p>
                <p className="text-xs text-stone max-w-xs mx-auto">
                  Explore our modern essentials, weighted shirts and fluid evening silhouettes.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-obsidian bg-gold hover:bg-gold-light px-5 py-2.5 rounded transition-all"
                  >
                    <span>Discover Collection</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.sku} className="py-4 flex gap-4">
                  <div className="relative w-20 h-24 bg-obsidian rounded overflow-hidden flex-shrink-0 border border-white/5">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="font-editorial text-sm font-semibold text-ivory hover:text-gold transition-colors line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.sku)}
                          className="text-stone hover:text-red-400 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="text-xs text-stone/80 mt-0.5">
                        Size: <span className="text-ivory font-medium">{item.size}</span> · Colour: <span className="text-ivory font-medium">{item.color}</span>
                      </p>
                      {item.sourcing === 'on_demand' && (
                        <span className="inline-block text-[9px] uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded mt-1 font-sans">
                          Sourced on-demand
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-white/10 rounded bg-obsidian">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.sku, -1)}
                          className="p-1.5 text-stone hover:text-ivory"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-ivory">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.sku, 1)}
                          className="p-1.5 text-stone hover:text-ivory"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-ivory font-sans">
                        {formatINR(item.pricePaise * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-obsidian-surface border-t border-white/10 space-y-4">
              <div className="space-y-1.5 text-xs text-stone">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-ivory font-medium font-sans">{formatINR(subtotalPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-gold font-medium uppercase tracking-wider text-[11px]">Free Express</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (GST Included)</span>
                  <span className="text-stone/60">Calculated</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-base font-semibold text-ivory">
                  <span>Estimated Total</span>
                  <span className="text-gold font-sans">{formatINR(subtotalPaise)}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-deep hover:from-gold-light hover:to-gold text-obsidian font-semibold tracking-wider uppercase text-xs py-3.5 rounded shadow-gold hover:shadow-gold-lg transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={15} />
                </Link>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone/60 pt-1">
                  <ShieldCheck size={13} className="text-gold/70" />
                  <span>Secure SSL Checkout · Cash on Delivery & UPI Supported</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
