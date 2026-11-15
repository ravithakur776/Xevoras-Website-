import React from 'react';

export const metadata = {
  title: 'Privacy Policy — XEVORAS',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8 font-sans text-xs text-stone leading-relaxed">
      <div className="border-b border-white/5 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">LEGAL COMPLIANCE</span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ivory mt-1">Privacy Policy &amp; Data Ethics</h1>
        <p className="text-stone/60 mt-1">Last revised: November 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-editorial text-lg font-bold text-ivory">1. Data We Collect</h2>
        <p>
          XEVORAS collects minimal personal data necessary to fulfil customer orders, process dispatches, and provide our digital shopping features. This includes customer name, shipping address, contact phone number, and email.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-editorial text-lg font-bold text-ivory">2. AI Virtual Try-On Image Processing</h2>
        <p>
          Customer portrait uploads for the Virtual Try-On feature are treated as strictly confidential and ephemeral. Customer photographs are never used to train neural network weights or machine learning models without express authorization. Uploaded assets are retained temporarily in volatile memory and purged automatically upon job completion.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-editorial text-lg font-bold text-ivory">3. Third-Party Disclosures &amp; Security</h2>
        <p>
          We do not sell, rent, or trade your personal data. Courier logistics partners (e.g. Delhivery, BlueDart) receive only the delivery address and contact number required to complete physical door-to-door transit.
        </p>
      </section>
    </div>
  );
}
