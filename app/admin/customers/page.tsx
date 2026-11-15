'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Users, Search, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';
import { formatINR } from '@/lib/utils/format';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const orders = data.orders || [];

          // Group by email/phone
          const customerMap: { [key: string]: any } = {};
          for (const ord of orders) {
            const email = ord.customer?.email || ord.guestEmail || ord.customer?.phone || `client-${ord.id.slice(0, 6)}`;
            if (!customerMap[email]) {
              customerMap[email] = {
                name: ord.customer?.fullName || 'Valued Client',
                email: ord.customer?.email || ord.guestEmail || '—',
                phone: ord.customer?.phone || ord.guestPhone || '—',
                city: ord.customer?.city || 'India',
                ordersCount: 0,
                totalSpentPaise: 0,
                lastOrderDate: ord.createdAt,
              };
            }
            customerMap[email].ordersCount += 1;
            customerMap[email].totalSpentPaise += ord.totalPaise;
          }
          setCustomers(Object.values(customerMap));
        }
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">CLIENT RELATIONSHIPS</span>
            <h1 className="font-editorial text-3xl font-bold text-ivory mt-1">Customer Directory</h1>
            <p className="text-xs text-stone mt-1">Verified customer profiles, shipping history, and lifetime order values.</p>
          </div>
          <span className="text-xs text-stone">{customers.length} Registered / Guest Patrons</span>
        </div>

        <div className="rounded-2xl bg-charcoal border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 bg-obsidian/60 text-stone uppercase font-bold text-[10px]">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Location</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4 text-right">Lifetime Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone/60">
                    {loading ? 'Compiling customer records...' : 'No customer records found.'}
                  </td>
                </tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-ivory text-sm">
                      {c.name}
                    </td>
                    <td className="p-4 space-y-0.5 text-stone">
                      <p className="flex items-center gap-1.5"><Mail size={12} className="text-gold" /> {c.email}</p>
                      <p className="flex items-center gap-1.5"><Phone size={12} className="text-stone/60" /> {c.phone}</p>
                    </td>
                    <td className="p-4 text-stone flex items-center gap-1.5 pt-5">
                      <MapPin size={12} className="text-gold" />
                      <span>{c.city}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-gold/15 text-gold font-bold text-[11px]">
                        {c.ordersCount} Order{c.ordersCount > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-ivory text-sm">
                      {formatINR(c.totalSpentPaise)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
