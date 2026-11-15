import React from 'react';

export const metadata = {
  title: 'Terms of Sale & Service — XEVORAS',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8 font-sans text-xs text-stone leading-relaxed">
      <div className="border-b border-white/5 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">TERMS OF SALE</span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">Terms &amp; Conditions</h1>
        <p className="text-stone/60 mt-1">Effective Date: November 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-editorial text-lg font-bold text-ivory">1. Commercial Agreement</h2>
        <p>
          By placing an order on XEVORAS (xevoras.com), you agree to these standard conditions of retail sale. All pricing is inclusive of Goods and Services Tax (GST) under Indian taxation statutes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-editorial text-lg font-bold text-ivory">2. Cash on Delivery (COD)</h2>
        <p>
          Cash on Delivery is provided across serviceable Indian pincodes. Customers agree to be present or have an authorized representative provide payment upon courier arrival.
        </p>
      </section>
    </div>
  );
}
