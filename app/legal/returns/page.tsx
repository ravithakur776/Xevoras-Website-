import React from 'react';

export const metadata = {
  title: 'Returns & Exchanges — XEVORAS',
};

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8 font-sans text-xs text-stone leading-relaxed">
      <div className="border-b border-white/5 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">ASSURANCE POLICY</span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">Returns &amp; Exchanges</h1>
        <p className="text-stone/60 mt-1">7-Day Easy Doorstep Reverse Pickups</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-editorial text-lg font-bold text-ivory">1. 7-Day Window</h2>
        <p>
          We want you to be completely satisfied with your XEVORAS pieces. If the fit or drape is not as expected, you may initiate an exchange or return within 7 calendar days of delivery.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-editorial text-lg font-bold text-ivory">2. Condition Guidelines</h2>
        <p>
          Returned garments must be unwashed, unworn, and retain all original brand tags and packaging. Reverse logistics pickups are arranged at zero cost to the client.
        </p>
      </section>
    </div>
  );
}
