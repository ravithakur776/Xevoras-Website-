import React from 'react';

export const metadata = {
  title: 'Shipping & Delivery — XEVORAS',
};

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8 font-sans text-xs text-stone leading-relaxed">
      <div className="border-b border-white/5 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">LOGISTICS POLICY</span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">Shipping &amp; Delivery</h1>
        <p className="text-stone/60 mt-1">Complimentary across all Indian States &amp; UTs</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-editorial text-lg font-bold text-ivory">1. Zero Shipping Fees</h2>
        <p>
          XEVORAS provides complimentary express shipping across India with zero minimum basket threshold. Every order is packed in our signature breathable garment boxes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-editorial text-lg font-bold text-ivory">2. Dispatch &amp; Transit Timelines</h2>
        <p>
          In-house physical inventory is dispatched within 24 hours of order confirmation. Metropolitan destinations (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata) typically receive delivery within 2 to 3 business days.
        </p>
      </section>
    </div>
  );
}
