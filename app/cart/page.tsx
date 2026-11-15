'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/store/cartContext';
import { formatINR } from '@/lib/utils/format';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotalPaise } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-charcoal border border-white/10 mx-auto flex items-center justify-center text-gold">
          <Sparkles size={32} />
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-stone text-sm max-w-md mx-auto">
          Explore our latest collection of column gowns, weighted shirts, and fluid essentials.
        </p>
        <div className="pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 btn-gold px-8 py-3.5 rounded text-xs uppercase tracking-wider font-bold shadow-gold"
          >
            <span>Explore Collection</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-baseline justify-between pb-6 border-b border-white/5 mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            BAG REVIEW
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">
            Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)} Items)
          </h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-stone hover:text-red-400 transition-colors"
        >
          Clear Entire Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 divide-y divide-white/5">
          {items.map((item) => (
            <div key={item.sku} className="py-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-24 sm:w-24 sm:h-32 bg-charcoal rounded overflow-hidden flex-shrink-0 border border-white/5">
                  <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                </div>
                <div className="space-y-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-editorial text-lg font-bold text-ivory hover:text-gold transition-colors line-clamp-1"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-xs text-stone">
                    Size: <strong className="text-ivory">{item.size}</strong> &middot; Colour: <strong className="text-ivory">{item.color}</strong>
                  </p>
                  <p className="text-xs font-sans text-stone/80">
                    SKU: {item.sku}
                  </p>
                  {item.sourcing === 'on_demand' && (
                    <span className="inline-block text-[9px] uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-sans">
                      Sourced On-Demand
                    </span>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                <div className="flex items-center border border-white/10 rounded bg-charcoal">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.sku, -1)}
                    className="p-2 text-stone hover:text-ivory"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="px-3 text-xs font-semibold text-ivory">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.sku, 1)}
                    className="p-2 text-stone hover:text-ivory"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="text-right flex items-center sm:block gap-4">
                  <p className="font-sans text-base font-bold text-ivory">
                    {formatINR(item.pricePaise * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.sku)}
                    className="text-stone hover:text-red-400 text-xs flex items-center gap-1 sm:mt-1"
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-xl bg-charcoal border border-white/10 space-y-6 sticky top-28">
            <h2 className="font-editorial text-xl font-bold text-ivory border-b border-white/5 pb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-stone font-sans">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-ivory font-semibold">{formatINR(subtotalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-gold font-bold uppercase tracking-wider">Free Express</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (5% Included)</span>
                <span className="text-stone/60">{formatINR(Math.round(subtotalPaise * 0.05))}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between text-base font-bold text-ivory">
                <span>Total Amount</span>
                <span className="text-gold font-sans">{formatINR(subtotalPaise)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/checkout"
                className="w-full py-4 btn-gold rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-gold"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={15} />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone/70 pt-2">
                <ShieldCheck size={14} className="text-gold" />
                <span>GST-inclusive invoice provided upon dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
