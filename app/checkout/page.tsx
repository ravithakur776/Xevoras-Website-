'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cartContext';
import { formatINR } from '@/lib/utils/format';
import { OrderService } from '@/lib/services/order.service';
import { ShippingAddress, Order } from '@/lib/types';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  Tag,
  AlertCircle,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalPaise, clearCart } = useCart();

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'PREPAID'>('COD');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscountPaise, setAppliedDiscountPaise] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'RARE10') {
      const discount = Math.round(subtotalPaise * 0.1);
      setAppliedDiscountPaise(discount);
      setCouponMessage({ text: 'Coupon RARE10 applied! 10% savings.', success: true });
    } else if (code === 'XEVORAS20') {
      const discount = Math.round(subtotalPaise * 0.2);
      setAppliedDiscountPaise(discount);
      setCouponMessage({ text: 'VIP Promo XEVORAS20 applied! 20% savings.', success: true });
    } else {
      setCouponMessage({ text: 'Invalid or expired promotional code.', success: false });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (
      !address.fullName ||
      !address.email ||
      !address.phone ||
      !address.addressLine1 ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      setFormError('Please fill in all mandatory shipping address fields.');
      return;
    }

    if (items.length === 0) {
      setFormError('Your shopping bag is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: address,
          items,
          paymentMethod,
          couponCode: couponMessage?.success ? couponCode.trim().toUpperCase() : undefined,
          notes: 'Website Direct Checkout',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order to database.');
      }

      const newOrder = data.order;
      setConfirmedOrder(newOrder);

      // Save to client cache & localStorage for account persistence
      try {
        OrderService.saveDirectOrder(newOrder);
        const storedOrders = JSON.parse(localStorage.getItem('xevoras_recent_orders') || '[]');
        localStorage.setItem(
          'xevoras_recent_orders',
          JSON.stringify([newOrder, ...storedOrders.slice(0, 9)])
        );
        localStorage.setItem('xevoras_client_email', address.email);
      } catch (err) {
        // Safe fallback if localStorage disabled
      }

      clearCart();
    } catch (err: any) {
      setFormError(`Order submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Confirmed State
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 size={36} />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
          ORDER CONFIRMED &middot; ALWAYS RARE
        </span>

        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory">
          Thank you, {confirmedOrder.customer.fullName}.
        </h1>

        <p className="text-sm text-stone max-w-lg mx-auto">
          Your order <strong className="text-ivory font-mono font-bold">{confirmedOrder.orderNumber}</strong> has been received by our studio workshop. We are preparing your pieces for complimentary express dispatch.
        </p>

        <div className="p-6 rounded-xl bg-charcoal border border-white/10 text-left space-y-4 max-w-xl mx-auto text-xs text-stone font-sans">
          <div className="flex justify-between border-b border-white/5 pb-3">
            <span>Payment Method:</span>
            <span className="font-bold text-ivory">{confirmedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid Online'}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-3">
            <span>Shipping Address:</span>
            <span className="text-right text-ivory">
              {confirmedOrder.customer.addressLine1}, {confirmedOrder.customer.city}, {confirmedOrder.customer.state} — {confirmedOrder.customer.pincode}
            </span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-3">
            <span>Total Payable:</span>
            <span className="font-bold text-gold text-sm font-sans">{formatINR(confirmedOrder.totalPaise)}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Delivery:</span>
            <span className="text-ivory">2–4 Business Days via Delhivery Express</span>
          </div>
        </div>

        <div className="pt-6 flex justify-center gap-4">
          <Link
            href="/account"
            className="px-6 py-3 rounded bg-charcoal border border-white/10 hover:border-gold text-ivory text-xs uppercase tracking-wider font-bold"
          >
            Track in Account
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 rounded btn-gold text-xs uppercase tracking-wider font-bold shadow-gold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const finalTotalPaise = Math.max(0, subtotalPaise - appliedDiscountPaise);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="pb-6 border-b border-white/5 mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
          SECURE DISPATCH
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">
          Checkout &amp; Delivery Details
        </h1>
      </div>

      {formError && (
        <div className="p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Shipping & Payment Options */}
        <div className="lg:col-span-7 space-y-8">
          {/* Shipping Address Card */}
          <div className="p-6 rounded-xl bg-charcoal border border-white/10 space-y-4">
            <h2 className="font-editorial text-lg font-bold text-ivory flex items-center gap-2">
              <Truck size={18} className="text-gold" />
              <span>1. Shipping Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-stone/80 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-stone/80 mb-1">Phone Number (10 digits) *</label>
                <input
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+91 98201 12345"
                  className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone/80 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={address.email}
                  onChange={(e) => setAddress({ ...address, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone/80 mb-1">Flat / Building / Street Address *</label>
                <input
                  type="text"
                  required
                  value={address.addressLine1}
                  onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                  placeholder="Apartment, Studio, Floor, Street"
                  className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-stone/80 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-stone/80 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="e.g. Maharashtra"
                  className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-stone/80 mb-1">Postal Pincode *</label>
                <input
                  type="text"
                  required
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="e.g. 400011"
                  className="w-full bg-obsidian border border-white/10 rounded p-2.5 text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-stone/80 mb-1">Country</label>
                <input
                  type="text"
                  disabled
                  value="India"
                  className="w-full bg-obsidian/40 border border-white/5 rounded p-2.5 text-stone/60"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-xl bg-charcoal border border-white/10 space-y-4">
            <h2 className="font-editorial text-lg font-bold text-ivory flex items-center gap-2">
              <CreditCard size={18} className="text-gold" />
              <span>2. Payment Preference</span>
            </h2>

            <div className="space-y-3 font-sans">
              <label className="flex items-center gap-3 p-3.5 rounded-lg border border-gold/40 bg-obsidian cursor-pointer hover:border-gold">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="accent-gold"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote size={16} className="text-gold" />
                    <span className="font-bold text-ivory text-xs">Cash on Delivery (COD)</span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Recommended</span>
                  </div>
                  <p className="text-[11px] text-stone mt-0.5">
                    Pay securely via cash or UPI scan when your parcel is delivered to your doorstep.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-lg border border-white/10 bg-obsidian cursor-pointer hover:border-gold">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'PREPAID'}
                  onChange={() => setPaymentMethod('PREPAID')}
                  className="accent-gold"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-gold" />
                    <span className="font-bold text-ivory text-xs">Online Prepaid (Cards / UPI / NetBanking)</span>
                  </div>
                  <p className="text-[11px] text-stone mt-0.5">
                    Secure merchant checkout gateway abstraction.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-charcoal border border-white/10 space-y-6 sticky top-28">
            <h2 className="font-editorial text-xl font-bold text-ivory border-b border-white/5 pb-4">
              Your Wardrobe Selection
            </h2>

            {/* Quick Item List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-white/5 pr-1 space-y-2">
              {items.map((i) => (
                <div key={i.sku} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-14 bg-obsidian rounded overflow-hidden flex-shrink-0">
                      <Image src={i.imageUrl} alt={i.productName} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-editorial font-bold text-ivory line-clamp-1">{i.productName}</p>
                      <p className="text-[11px] text-stone">Qty: {i.quantity} &middot; Size: {i.size}</p>
                    </div>
                  </div>
                  <span className="font-sans font-bold text-ivory">
                    {formatINR(i.pricePaise * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Application */}
            <div className="pt-2 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code (e.g. RARE10)"
                  className="bg-obsidian border border-white/10 rounded px-3 py-2 text-xs text-ivory placeholder-stone/40 uppercase tracking-wider flex-1 focus:outline-none focus:border-gold"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3.5 py-2 bg-charcoal border border-white/15 hover:border-gold text-ivory text-xs font-bold uppercase rounded"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className={`text-[11px] mt-1.5 ${couponMessage.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-stone font-sans border-t border-white/5 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-ivory font-semibold">{formatINR(subtotalPaise)}</span>
              </div>
              {appliedDiscountPaise > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promotional Savings</span>
                  <span>- {formatINR(appliedDiscountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-gold font-bold uppercase tracking-wider text-[11px]">Free Express</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5% Included)</span>
                <span className="text-stone/60">{formatINR(Math.round(finalTotalPaise * 0.05))}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between text-base font-bold text-ivory">
                <span>Total Amount</span>
                <span className="text-gold font-sans">{formatINR(finalTotalPaise)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-4 btn-gold rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-gold"
            >
              <span>{isSubmitting ? 'Confirming Order...' : 'Confirm Order Now'}</span>
              <ArrowRight size={15} />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone/60 pt-1">
              <ShieldCheck size={13} className="text-gold/70" />
              <span>100% Encrypted &middot; Dispatched by XEVORAS Studio</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
