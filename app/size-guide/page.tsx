'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ruler, Sparkles, Box } from 'lucide-react';

export default function SizeGuidePage() {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [activeGender, setActiveGender] = useState<'women' | 'men'>('women');

  const womenMeasurementsInches = [
    { size: 'XS', bust: '32 - 34', waist: '24 - 26', hips: '34 - 36', length: '52' },
    { size: 'S', bust: '34 - 36', waist: '26 - 28', hips: '36 - 38', length: '53' },
    { size: 'M', bust: '36 - 38', waist: '28 - 30', hips: '38 - 40', length: '54' },
    { size: 'L', bust: '38 - 40', waist: '30 - 32', hips: '40 - 42', length: '55' },
    { size: 'XL', bust: '40 - 42', waist: '32 - 34', hips: '42 - 44', length: '56' },
  ];

  const menMeasurementsInches = [
    { size: 'S', chest: '36 - 38', waist: '30 - 32', collar: '15.0', length: '29' },
    { size: 'M', chest: '38 - 40', waist: '32 - 34', collar: '15.5', length: '30' },
    { size: 'L', chest: '40 - 42', waist: '34 - 36', collar: '16.0', length: '31' },
    { size: 'XL', chest: '42 - 44', waist: '36 - 38', collar: '16.5', length: '32' },
    { size: 'XXL', chest: '44 - 46', waist: '38 - 40', collar: '17.0', length: '33' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
          PRECISION TAILORING
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-ivory">
          Fit &amp; Size Guide
        </h1>
        <p className="text-xs sm:text-sm text-stone max-w-lg mx-auto">
          Every XEVORAS garment is cut to precise architectural proportions. Refer to our benchmark charts below or test silhouettes in the 3D Avatar Studio.
        </p>
      </div>

      {/* 3D Avatar Studio Callout */}
      <div className="p-6 rounded-xl bg-charcoal border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="font-editorial text-lg font-bold text-ivory">Want an exact proportion preview?</p>
          <p className="text-xs text-stone mt-0.5">
            Use the XEVORAS 3D Studio to set your exact height and body type.
          </p>
        </div>
        <Link
          href="/avatar-studio"
          className="inline-flex items-center gap-2 btn-gold px-6 py-2.5 rounded text-xs uppercase tracking-wider font-bold shadow-gold"
        >
          <Box size={14} />
          <span>Launch 3D Studio</span>
        </Link>
      </div>

      {/* Gender & Unit Selectors */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveGender('women')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              activeGender === 'women' ? 'bg-gold text-obsidian' : 'bg-charcoal text-stone hover:text-ivory'
            }`}
          >
            Women&apos;s Sizing
          </button>
          <button
            type="button"
            onClick={() => setActiveGender('men')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              activeGender === 'men' ? 'bg-gold text-obsidian' : 'bg-charcoal text-stone hover:text-ivory'
            }`}
          >
            Men&apos;s Sizing
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone">
          <span>Units:</span>
          <button
            type="button"
            onClick={() => setUnit('inches')}
            className={`px-2.5 py-1 rounded text-xs font-bold ${
              unit === 'inches' ? 'text-gold underline' : 'text-stone'
            }`}
          >
            Inches (&quot;)
          </button>
          <span>&middot;</span>
          <button
            type="button"
            onClick={() => setUnit('cm')}
            className={`px-2.5 py-1 rounded text-xs font-bold ${
              unit === 'cm' ? 'text-gold underline' : 'text-stone'
            }`}
          >
            Centimetres (cm)
          </button>
        </div>
      </div>

      {/* Sizing Table */}
      <div className="rounded-xl bg-charcoal border border-white/10 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-white/10 text-gold uppercase tracking-wider font-semibold">
              <th className="p-4">Size Code</th>
              {activeGender === 'women' ? (
                <>
                  <th className="p-4">Bust ({unit})</th>
                  <th className="p-4">Waist ({unit})</th>
                  <th className="p-4">Hips ({unit})</th>
                  <th className="p-4">Gown Length ({unit})</th>
                </>
              ) : (
                <>
                  <th className="p-4">Chest ({unit})</th>
                  <th className="p-4">Waist ({unit})</th>
                  <th className="p-4">Collar ({unit})</th>
                  <th className="p-4">Shirt Length ({unit})</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {activeGender === 'women'
              ? womenMeasurementsInches.map((row) => (
                  <tr key={row.size} className="hover:bg-white/5">
                    <td className="p-4 font-bold text-ivory text-sm">{row.size}</td>
                    <td className="p-4 text-stone">{unit === 'cm' ? '81 - 86' : row.bust}</td>
                    <td className="p-4 text-stone">{unit === 'cm' ? '61 - 66' : row.waist}</td>
                    <td className="p-4 text-stone">{unit === 'cm' ? '86 - 91' : row.hips}</td>
                    <td className="p-4 text-stone">{unit === 'cm' ? '132' : row.length}</td>
                  </tr>
                ))
              : menMeasurementsInches.map((row) => (
                  <tr key={row.size} className="hover:bg-white/5">
                    <td className="p-4 font-bold text-ivory text-sm">{row.size}</td>
                    <td className="p-4 text-stone">{unit === 'cm' ? '91 - 96' : row.chest}</td>
                    <td className="p-4 text-stone">{unit === 'cm' ? '76 - 81' : row.waist}</td>
                    <td className="p-4 text-stone">{unit === 'cm' ? '38.1' : row.collar}</td>
                    <td className="p-4 text-stone">{unit === 'cm' ? '74' : row.length}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Measurement Tips */}
      <div className="p-6 rounded-xl bg-charcoal border border-white/5 space-y-3 text-xs text-stone font-sans">
        <h3 className="font-editorial text-base font-bold text-ivory">How to Measure Accurately</h3>
        <p><strong>Bust / Chest:</strong> Measure under the arms at the fullest part of the bust or chest while standing upright.</p>
        <p><strong>Waist:</strong> Measure around the natural waistline, allowing the tape to sit comfortably without pulling tight.</p>
        <p><strong>Drape Note:</strong> XEVORAS weighted fabrics hold their form naturally without clinging to the skin.</p>
      </div>
    </div>
  );
}
