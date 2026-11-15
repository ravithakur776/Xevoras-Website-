'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderService } from '@/lib/services/order.service';
import { useWishlist } from '@/lib/store/wishlistContext';
import { INITIAL_PRODUCTS } from '@/lib/data/initialCatalog';
import { formatINR, formatDate } from '@/lib/utils/format';
import { Order } from '@/lib/types';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Box,
  Truck,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Search,
  AlertCircle,
} from 'lucide-react';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackNumberInput, setTrackNumberInput] = useState('');
  const [trackPhoneInput, setTrackPhoneInput] = useState('');
  const [trackError, setTrackError] = useState('');
  const [isSearchingOrder, setIsSearchingOrder] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const { wishlistIds } = useWishlist();

  // Load client order history from server / localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('xevoras_client_email') || '';
      const storedName = localStorage.getItem('xevoras_client_name') || '';
      const storedPhone = localStorage.getItem('xevoras_client_phone') || '';
      setClientEmail(storedEmail);
      setClientName(storedName);
      setClientPhone(storedPhone);

      if (storedEmail) {
        fetch(`/api/orders?email=${encodeURIComponent(storedEmail)}`)
          .then((res) => (res.ok ? res.json() : { orders: [] }))
          .then((data) => {
            if (data.orders && Array.isArray(data.orders)) {
              setOrders(data.orders);
            }
          })
          .catch(() => {});
      } else {
        const local = JSON.parse(localStorage.getItem('xevoras_recent_orders') || '[]');
        if (local.length > 0) {
          setOrders(local);
        } else {
          setOrders([]);
        }
      }
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('xevoras_client_email', clientEmail.trim());
      localStorage.setItem('xevoras_client_name', clientName.trim());
      localStorage.setItem('xevoras_client_phone', clientPhone.trim());
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

  const handleTrackSpecificOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    if (!trackNumberInput.trim()) {
      setTrackError('Please provide an Order Number (e.g. XV-89104).');
      return;
    }

    setIsSearchingOrder(true);
    try {
      const emailOrPhone = trackPhoneInput.trim() || clientEmail || '';
      const queryParam = emailOrPhone.includes('@') ? `email=${encodeURIComponent(emailOrPhone)}` : `phone=${encodeURIComponent(emailOrPhone)}`;
      const res = await fetch(
        `/api/orders?orderNumber=${encodeURIComponent(trackNumberInput.trim())}&${queryParam}`
      );
      const data = await res.json();
      if (!res.ok || !data.orders || data.orders.length === 0) {
        throw new Error(data.error || 'No matching order found for this number.');
      }

      // Prepend found order to list
      const foundOrder = data.orders[0];
      setOrders([foundOrder, ...orders.filter((o) => o.orderNumber !== foundOrder.orderNumber)]);
      setTrackNumberInput('');
      setTrackPhoneInput('');
    } catch (err: any) {
      setTrackError(err.message || 'Lookup failed.');
    } finally {
      setIsSearchingOrder(false);
    }
  };

  const wishlistedProducts = INITIAL_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row items-baseline justify-between pb-6 border-b border-white/5 mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            CLIENT PORTAL
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">
            My Account &amp; Order History
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone">
          <span>Client: Aarav Sharma</span>
          <span>&middot;</span>
          <span className="text-gold">Privileged Member</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-3 space-y-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'text-stone hover:text-ivory hover:bg-white/5'
            }`}
          >
            <ShoppingBag size={16} />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'text-stone hover:text-ivory hover:bg-white/5'
            }`}
          >
            <Heart size={16} />
            <span>Wishlist ({wishlistIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'addresses'
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'text-stone hover:text-ivory hover:bg-white/5'
            }`}
          >
            <MapPin size={16} />
            <span>Saved Addresses</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'text-stone hover:text-ivory hover:bg-white/5'
            }`}
          >
            <User size={16} />
            <span>Personal Details</span>
          </button>
        </aside>

        {/* Content Area */}
        <div className="md:col-span-9">
          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Live Order Tracker Bar */}
              <div className="p-5 rounded-xl bg-charcoal border border-gold/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-gold" />
                  <h3 className="font-editorial text-base font-bold text-ivory">Track Dispatch &amp; Delivery</h3>
                </div>
                <form onSubmit={handleTrackSpecificOrder} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter Order # (e.g. XV-89104)"
                    value={trackNumberInput}
                    onChange={(e) => setTrackNumberInput(e.target.value)}
                    className="flex-1 bg-obsidian border border-white/10 rounded px-3 py-2 text-xs text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    placeholder="Email or Phone on order"
                    value={trackPhoneInput}
                    onChange={(e) => setTrackPhoneInput(e.target.value)}
                    className="flex-1 bg-obsidian border border-white/10 rounded px-3 py-2 text-xs text-ivory placeholder-stone/40 focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingOrder}
                    className="px-5 py-2 btn-gold rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-gold disabled:opacity-50"
                  >
                    <Search size={13} />
                    <span>{isSearchingOrder ? 'Searching...' : 'Track'}</span>
                  </button>
                </form>
                {trackError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={13} />
                    <span>{trackError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <h2 className="font-editorial text-2xl font-bold text-ivory">Recent Orders</h2>
                <span className="text-xs text-stone">{orders.length} orders recorded</span>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 rounded-xl bg-charcoal border border-white/10 space-y-4 font-sans"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 gap-2">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-base text-ivory">
                            {order.orderNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gold/15 text-gold border border-gold/30">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone mt-0.5">Placed on {formatDate(order.createdAt)}</p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-base text-ivory font-sans">
                          {formatINR(order.totalPaise)}
                        </span>
                        <p className="text-[11px] text-stone">
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid Online'}
                        </p>
                      </div>
                    </div>

                    {/* Order Item List */}
                    <div className="space-y-3">
                      {order.items.map((it) => (
                        <div key={it.sku} className="flex items-center gap-4 text-xs">
                          <div className="relative w-14 h-16 bg-obsidian rounded overflow-hidden flex-shrink-0">
                            <Image src={it.imageUrl || '/images/hero-luxury.jpg'} alt={it.productName} fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="font-editorial text-sm font-bold text-ivory">{it.productName}</p>
                            <p className="text-stone">Qty: {it.qty} &middot; Size: {it.size} &middot; Colour: {it.color}</p>
                          </div>
                          <span className="font-bold text-ivory">{formatINR(it.pricePaise * it.qty)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Information */}
                    {order.trackingNumber && (
                      <div className="p-3 bg-obsidian rounded border border-white/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-stone">
                          <Truck size={15} className="text-gold" />
                          <span>Dispatched via <strong>{order.trackingCarrier}</strong> &middot; AWB: {order.trackingNumber}</span>
                        </div>
                        <span className="text-emerald-400 font-bold">In Transit</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-editorial text-2xl font-bold text-ivory">Saved Wishlist Pieces</h2>
              {wishlistedProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-charcoal rounded-xl border border-white/5">
                  <Heart size={32} className="mx-auto text-stone/40" />
                  <p className="font-editorial text-xl text-ivory">Your Wishlist is Empty</p>
                  <p className="text-xs text-stone">Click the heart icon on any piece to save it for later.</p>
                  <Link href="/shop" className="inline-block mt-2 px-5 py-2.5 btn-gold rounded text-xs font-bold uppercase">
                    Explore Pieces
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlistedProducts.map((p) => (
                    <div key={p.id} className="p-3 bg-charcoal rounded-lg border border-white/5 space-y-2">
                      <div className="relative aspect-[3/4] rounded overflow-hidden">
                        <Image src={p.images[0]?.url || '/media/products/women-1.jpg'} alt={p.name} fill className="object-cover" />
                      </div>
                      <p className="font-editorial font-bold text-sm text-ivory truncate">{p.name}</p>
                      <p className="text-xs text-gold font-bold">{formatINR(p.pricePaise)}</p>
                      <Link
                        href={`/product/${p.slug}`}
                        className="block w-full text-center py-2 bg-obsidian border border-white/10 hover:border-gold rounded text-[11px] font-bold text-ivory uppercase"
                      >
                        View Piece
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <h2 className="font-editorial text-2xl font-bold text-ivory">Saved Addresses</h2>
              {orders.length > 0 && orders[0].customer ? (
                <div className="p-6 rounded-xl bg-charcoal border border-white/10 space-y-2 text-xs font-sans max-w-md">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gold/15 text-gold">Primary Delivery</span>
                  <p className="font-bold text-ivory text-sm mt-2">{orders[0].customer.fullName}</p>
                  <p className="text-stone">{orders[0].customer.addressLine1}</p>
                  <p className="text-stone">{orders[0].customer.city}, {orders[0].customer.state} &mdash; {orders[0].customer.pincode}</p>
                  <p className="text-stone">Phone: {orders[0].customer.phone}</p>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-charcoal border border-white/10 text-center max-w-md">
                  <p className="text-ivory font-editorial text-lg mb-1">No Delivery Address on File</p>
                  <p className="text-stone text-xs">
                    Your shipping address will be safely remembered here after your first completed checkout.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-md">
              <h2 className="font-editorial text-2xl font-bold text-ivory">Client Profile</h2>
              {profileSaved && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded">
                  ✓ Profile preferences saved successfully.
                </div>
              )}
              <form onSubmit={handleSaveProfile} className="p-6 rounded-xl bg-charcoal border border-white/10 space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-obsidian p-2.5 rounded border border-white/10 text-ivory focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full bg-obsidian p-2.5 rounded border border-white/10 text-ivory focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full bg-obsidian p-2.5 rounded border border-white/10 text-ivory focus:border-gold focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gold hover:bg-[#A38250] text-obsidian text-xs font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Save Profile
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
