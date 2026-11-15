'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AvatarStudioCanvas } from '@/components/avatar/AvatarStudioCanvas';
import { AvatarState, SavedLook, Product } from '@/lib/types';
import { useCart } from '@/lib/store/cartContext';
import { INITIAL_PRODUCTS } from '@/lib/data/initialCatalog';
import { formatINR } from '@/lib/utils/format';
import {
  Box,
  ShoppingBag,
  Heart,
  Share2,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  ChevronRight,
  Trash2,
  Eye,
  Info,
  Layers,
  User,
  Scissors,
} from 'lucide-react';

interface CatalogGarmentOption {
  id: string;
  name: string;
  category: string;
  gender: 'women' | 'men' | 'all';
  pricePaise: number;
  slug: string;
  imageUrl: string;
  material: string;
  fitNotes: string;
  colors: { label: string; hex: string }[];
}

const CATALOG_GARMENTS: CatalogGarmentOption[] = [
  // Category 1: Column Gowns & Eveningwear
  {
    id: 'the-column-gown',
    name: 'The Column Gown',
    category: 'dresses',
    gender: 'women',
    pricePaise: 489000,
    slug: 'the-column-gown',
    imageUrl: '/media/products/women-1.jpg',
    material: '78% Viscose, 22% Recycled Poly',
    fitNotes: 'Narrow column silhouette with fluid floor drape',
    colors: [
      { label: 'Crimson Ruby', hex: '#8a1f2b' },
      { label: 'Obsidian Noir', hex: '#1C1C1C' },
      { label: 'Champagne Gold', hex: '#B89560' },
    ],
  },
  {
    id: 'fleur-bias-midi',
    name: 'Fleur Bias Midi',
    category: 'dresses',
    gender: 'women',
    pricePaise: 329000,
    slug: 'fleur-bias-midi',
    imageUrl: '/media/products/women-2.jpg',
    material: '100% Mulberry Silk',
    fitNotes: 'Bias cut body drape skimming curves naturally',
    colors: [
      { label: 'Champagne Gold', hex: '#B89560' },
      { label: 'Warm Stone', hex: '#B9ADA1' },
      { label: 'Obsidian Noir', hex: '#1C1C1C' },
    ],
  },

  // Category 2: Structured Weighted Shirts
  {
    id: 'oxford-dress-shirt',
    name: 'Oxford Dress Shirt',
    category: 'shirts',
    gender: 'all',
    pricePaise: 349000,
    slug: 'oxford-dress-shirt',
    imageUrl: '/media/products/men-2.jpg',
    material: '100% 2-Ply Long-Staple Cotton',
    fitNotes: 'Structured tailored collar with easy torso ease',
    colors: [
      { label: 'Warm Ivory', hex: '#F5F1E8' },
      { label: 'Obsidian Noir', hex: '#1C1C1C' },
      { label: 'Olive Clay', hex: '#704B40' },
    ],
  },
  {
    id: 'indigo-workshirt',
    name: 'Indigo Workshirt',
    category: 'shirts',
    gender: 'men',
    pricePaise: 399000,
    slug: 'indigo-workshirt',
    imageUrl: '/media/products/men-3.jpg',
    material: 'Selvedge Chambray Cotton',
    fitNotes: 'Relaxed utilitarian drape with reinforced placket',
    colors: [
      { label: 'Deep Indigo', hex: '#243447' },
      { label: 'Warm Stone', hex: '#B9ADA1' },
      { label: 'Obsidian Noir', hex: '#1C1C1C' },
    ],
  },

  // Category 3: Archival Trench Coats & Layering
  {
    id: 'azure-trench',
    name: 'Azure Trench Coat',
    category: 'outerwear',
    gender: 'all',
    pricePaise: 849000,
    slug: 'azure-trench',
    imageUrl: '/media/products/women-3.jpg',
    material: 'Double-Weave Gabardine Wool',
    fitNotes: 'Structured double-breasted fit with cinched waist belt',
    colors: [
      { label: 'Champagne Gold', hex: '#B89560' },
      { label: 'Warm Stone', hex: '#B9ADA1' },
      { label: 'Obsidian Noir', hex: '#1C1C1C' },
    ],
  },
  {
    id: 'nocturne-wool-overcoat',
    name: 'Nocturne Wool Overcoat',
    category: 'outerwear',
    gender: 'men',
    pricePaise: 989000,
    slug: 'nocturne-wool-overcoat',
    imageUrl: '/media/products/men-5.jpg',
    material: '100% Merino Melange Wool',
    fitNotes: 'Architectural shoulders with knee-length drape',
    colors: [
      { label: 'Obsidian Noir', hex: '#1C1C1C' },
      { label: 'Clay Charcoal', hex: '#3B3836' },
      { label: 'Warm Stone', hex: '#B9ADA1' },
    ],
  },

  // Category 4: Co-ords & Tailored Sets
  {
    id: 'solstice-track-set',
    name: 'Solstice Track Set',
    category: 'coords',
    gender: 'all',
    pricePaise: 289000,
    slug: 'solstice-track-set',
    imageUrl: '/media/products/women-5.jpg',
    material: 'Silk Organza & Soft Interlock Knit',
    fitNotes: 'Cropped tailored top with wide-leg palazzo trousers',
    colors: [
      { label: 'Warm Ivory', hex: '#F5F1E8' },
      { label: 'Champagne Gold', hex: '#B89560' },
      { label: 'Obsidian Noir', hex: '#1C1C1C' },
    ],
  },
];

const SKIN_TONES = [
  { label: 'Porcelain Alabaster', hex: '#F5E6D3' },
  { label: 'Warm Sand', hex: '#DEB887' },
  { label: 'Champagne Olive', hex: '#C68B59' },
  { label: 'Rich Chestnut', hex: '#8D5524' },
  { label: 'Deep Espresso', hex: '#3D2314' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function AvatarStudioPage() {
  const { addItem } = useCart();

  // Active customizer tab for mobile screens
  const [mobileTab, setMobileTab] = useState<'avatar' | 'garment' | 'looks'>('avatar');

  // Avatar and garment configuration
  const [avatarState, setAvatarState] = useState<AvatarState>({
    gender: 'female',
    bodyShape: 'slender',
    skinTone: '#C68B59',
    heightCm: 175,
    selectedCategory: 'dresses',
    selectedGarmentId: 'the-column-gown',
    selectedColor: '#8a1f2b', // Crimson
    selectedSize: 'M',
    garmentName: 'The Column Gown',
  });

  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedBag, setAddedBag] = useState(false);
  const [lookSaved, setLookSaved] = useState(false);

  // Initialize from URL search parameters and localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check URL parameters for deep-linked look
    const params = new URLSearchParams(window.location.search);
    const paramGender = params.get('gender');
    const paramBody = params.get('body');
    const paramHeight = params.get('height');
    const paramCategory = params.get('category');
    const paramGarment = params.get('garment');
    const paramColor = params.get('color');
    const paramSize = params.get('size');

    if (paramGender || paramCategory || paramGarment) {
      setAvatarState((prev) => ({
        ...prev,
        gender: (paramGender as any) || prev.gender,
        bodyShape: (paramBody as any) || prev.bodyShape,
        heightCm: paramHeight ? Number(paramHeight) : prev.heightCm,
        selectedCategory: paramCategory || prev.selectedCategory,
        selectedGarmentId: paramGarment || prev.selectedGarmentId,
        selectedColor: paramColor || prev.selectedColor,
        selectedSize: paramSize || prev.selectedSize,
      }));
    }

    // 2. Load persistent saved looks from localStorage
    try {
      const stored = localStorage.getItem('xevoras_saved_looks');
      if (stored) {
        setSavedLooks(JSON.parse(stored));
      }
    } catch {
      // Fallback
    }
  }, []);

  // Determine current active garment object
  const activeGarment =
    CATALOG_GARMENTS.find((g) => g.id === avatarState.selectedGarmentId) ||
    CATALOG_GARMENTS.find((g) => g.category === avatarState.selectedCategory) ||
    CATALOG_GARMENTS[0];

  // Filter garments based on selected category & model gender
  const availableGarmentsInCategory = CATALOG_GARMENTS.filter(
    (g) =>
      g.category === avatarState.selectedCategory &&
      (g.gender === 'all' ||
        (avatarState.gender === 'male' ? g.gender === 'men' : g.gender === 'women'))
  );

  // When category changes, ensure selected garment stays synchronized
  const handleSelectCategory = (catId: string) => {
    const match =
      CATALOG_GARMENTS.find(
        (g) =>
          g.category === catId &&
          (g.gender === 'all' ||
            (avatarState.gender === 'male' ? g.gender === 'men' : g.gender === 'women'))
      ) || CATALOG_GARMENTS.find((g) => g.category === catId);

    if (match) {
      setAvatarState({
        ...avatarState,
        selectedCategory: catId,
        selectedGarmentId: match.id,
        garmentName: match.name,
        selectedColor: match.colors[0]?.hex || avatarState.selectedColor,
      });
    } else {
      setAvatarState({ ...avatarState, selectedCategory: catId });
    }
  };

  const handleSelectGarment = (garment: CatalogGarmentOption) => {
    setAvatarState({
      ...avatarState,
      selectedCategory: garment.category,
      selectedGarmentId: garment.id,
      garmentName: garment.name,
      selectedColor: garment.colors[0]?.hex || avatarState.selectedColor,
    });
  };

  // Save Look to localStorage
  const handleSaveLook = () => {
    const newLook: SavedLook = {
      id: 'look_' + Date.now(),
      title: `${activeGarment.name} (${avatarState.bodyShape.toUpperCase()} FIT)`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      avatarState: { ...avatarState },
      productIds: [activeGarment.id],
    };
    const updated = [newLook, ...savedLooks.slice(0, 9)];
    setSavedLooks(updated);
    try {
      localStorage.setItem('xevoras_saved_looks', JSON.stringify(updated));
    } catch {
      // Fallback
    }
    setLookSaved(true);
    setTimeout(() => setLookSaved(false), 2500);
  };

  const handleDeleteSavedLook = (lookId: string) => {
    const updated = savedLooks.filter((l) => l.id !== lookId);
    setSavedLooks(updated);
    try {
      localStorage.setItem('xevoras_saved_looks', JSON.stringify(updated));
    } catch {
      // Fallback
    }
  };

  // Add configured look piece to real cart
  const handleAddOutfitToBag = () => {
    const selectedSize = avatarState.selectedSize || 'M';
    const colorLabel =
      activeGarment.colors.find((c) => c.hex.toLowerCase() === avatarState.selectedColor.toLowerCase())
        ?.label || 'Studio Custom';

    addItem({
      productId: activeGarment.id,
      productName: activeGarment.name,
      slug: activeGarment.slug,
      sku: `XV-3D-${activeGarment.slug.toUpperCase()}-${selectedSize}`,
      size: selectedSize,
      color: colorLabel,
      pricePaise: activeGarment.pricePaise,
      imageUrl: activeGarment.imageUrl,
      sourcing: 'own',
      quantity: 1,
    });

    setAddedBag(true);
    setTimeout(() => setAddedBag(false), 2200);
  };

  // Generate deep link with URL parameters
  const handleShareLook = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('gender', avatarState.gender);
    url.searchParams.set('body', avatarState.bodyShape);
    url.searchParams.set('height', String(avatarState.heightCm));
    url.searchParams.set('category', avatarState.selectedCategory);
    url.searchParams.set('garment', activeGarment.id);
    url.searchParams.set('color', avatarState.selectedColor);
    url.searchParams.set('size', avatarState.selectedSize || 'M');

    navigator.clipboard?.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row items-baseline justify-between pb-6 border-b border-white/5 mb-6 sm:mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
              DIGITAL RUNWAY ATELIER
            </span>
            <Sparkles size={13} className="text-gold" />
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-ivory mt-1">
            XEVORAS 3D Avatar Studio
          </h1>
          <p className="text-xs text-stone mt-1 max-w-xl">
            Real-time WebGL fitting experience. Customize anatomical proportions and audition signature archival silhouettes.
          </p>
        </div>

        {/* Global Studio Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShareLook}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-charcoal border border-white/10 hover:border-gold rounded text-xs text-stone hover:text-ivory transition-colors shadow-md"
            title="Copy shareable configuration link"
          >
            <Share2 size={13} />
            <span>{copiedLink ? 'Link Copied!' : 'Share Look'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveLook}
            className="flex items-center gap-1.5 px-4 py-2 bg-charcoal border border-gold/40 hover:border-gold rounded text-xs text-gold font-semibold transition-colors shadow-md"
            title="Save look to local library"
          >
            <Heart size={13} />
            <span>{lookSaved ? 'Look Saved!' : 'Save Look'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: 3D Stage (Left/Center) + Customizer Dock (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3D Canvas Stage */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <div className="h-[520px] sm:h-[640px] w-full">
            <AvatarStudioCanvas avatarState={avatarState} />
          </div>

          {/* Quick Garment Spec & Bag Action Card below Canvas */}
          <div className="mt-4 p-5 rounded-xl bg-charcoal border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-16 rounded bg-obsidian overflow-hidden flex-shrink-0 border border-white/5">
                <Image
                  src={activeGarment.imageUrl}
                  alt={activeGarment.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-gold font-bold">
                    ACTIVE ARCHIVAL PIECE
                  </span>
                  <span className="text-[10px] text-stone">&middot;</span>
                  <span className="text-[10px] text-stone font-mono">Size {avatarState.selectedSize || 'M'}</span>
                </div>
                <p className="font-editorial text-lg font-bold text-ivory">{activeGarment.name}</p>
                <p className="text-xs text-stone font-sans">
                  {formatINR(activeGarment.pricePaise)} &middot; {activeGarment.material}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/product/${activeGarment.slug}`}
                className="px-4 py-2.5 rounded bg-obsidian border border-white/10 hover:border-gold text-stone hover:text-ivory text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Inspect Details
              </Link>

              <button
                type="button"
                onClick={handleAddOutfitToBag}
                className={`px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  addedBag ? 'bg-emerald-500 text-obsidian' : 'btn-gold shadow-gold hover:shadow-gold-lg'
                }`}
              >
                <ShoppingBag size={14} />
                <span>{addedBag ? 'Added to Bag' : 'Add Look to Bag'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Customization Control Dock */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Mobile Tab Strip (Only on mobile < 1024px) */}
          <div className="grid grid-cols-3 gap-2 lg:hidden bg-charcoal p-1.5 rounded-lg border border-white/10 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setMobileTab('avatar')}
              className={`py-2 rounded transition-colors ${
                mobileTab === 'avatar' ? 'bg-gold text-obsidian' : 'text-stone hover:text-ivory'
              }`}
            >
              Model
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('garment')}
              className={`py-2 rounded transition-colors ${
                mobileTab === 'garment' ? 'bg-gold text-obsidian' : 'text-stone hover:text-ivory'
              }`}
            >
              Garment
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('looks')}
              className={`py-2 rounded transition-colors ${
                mobileTab === 'looks' ? 'bg-gold text-obsidian' : 'text-stone hover:text-ivory'
              }`}
            >
              Saved ({savedLooks.length})
            </button>
          </div>

          {/* PARAMETER DOCK: AVATAR / MODEL */}
          <div
            className={`p-6 rounded-xl bg-charcoal border border-white/10 space-y-6 shadow-xl ${
              mobileTab !== 'avatar' ? 'hidden lg:block' : ''
            }`}
          >
            <h2 className="font-editorial text-lg font-bold text-ivory flex items-center gap-2 border-b border-white/5 pb-3">
              <User size={16} className="text-gold" />
              <span>1. Anatomical Model Customization</span>
            </h2>

            {/* 1. Presentation Model Gender */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-stone font-bold">
                Presentation Silhouette
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'female', label: 'Female Hourglass' },
                  { id: 'male', label: 'Male V-Taper' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setAvatarState({ ...avatarState, gender: g.id as any })}
                    className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded border transition-all ${
                      avatarState.gender === g.id
                        ? 'border-gold bg-gold text-obsidian shadow-gold'
                        : 'border-white/10 bg-obsidian text-stone hover:text-ivory'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Body Shape Proportions */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-stone font-bold">
                Body Proportion Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['slender', 'athletic', 'curvy', 'broad'] as const).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => setAvatarState({ ...avatarState, bodyShape: shape })}
                    className={`py-2.5 px-3 text-xs font-semibold rounded capitalize border text-left transition-all ${
                      avatarState.bodyShape === shape
                        ? 'border-gold bg-gold/15 text-gold'
                        : 'border-white/10 bg-obsidian text-stone hover:text-ivory'
                    }`}
                  >
                    <span className="block font-bold">{shape}</span>
                    <span className="text-[10px] text-stone/60">
                      {shape === 'slender' && '0.95x ease'}
                      {shape === 'athletic' && '1.08x toned'}
                      {shape === 'curvy' && '1.16x contoured'}
                      {shape === 'broad' && '1.24x relaxed'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Height Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="uppercase tracking-wider text-stone font-bold">Stature / Height</span>
                <span className="font-bold text-ivory font-mono">{avatarState.heightCm} cm</span>
              </div>
              <input
                type="range"
                min="155"
                max="195"
                value={avatarState.heightCm}
                onChange={(e) => setAvatarState({ ...avatarState, heightCm: Number(e.target.value) })}
                className="w-full accent-gold bg-obsidian cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone/50 font-sans">
                <span>155 cm (5&apos;1&quot;)</span>
                <span>175 cm (Standard)</span>
                <span>195 cm (6&apos;5&quot;)</span>
              </div>
            </div>

            {/* 4. Skin Tone Palette */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-stone font-bold">
                Skin Tone Palette
              </label>
              <div className="flex items-center gap-3">
                {SKIN_TONES.map((tone) => (
                  <button
                    key={tone.label}
                    type="button"
                    title={tone.label}
                    onClick={() => setAvatarState({ ...avatarState, skinTone: tone.hex })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      avatarState.skinTone === tone.hex
                        ? 'border-gold scale-125 shadow-gold'
                        : 'border-white/20 hover:scale-110'
                    }`}
                    style={{ backgroundColor: tone.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* PARAMETER DOCK: WARDROBE & GARMENT SELECTION */}
          <div
            className={`p-6 rounded-xl bg-charcoal border border-white/10 space-y-6 shadow-xl ${
              mobileTab !== 'garment' ? 'hidden lg:block' : ''
            }`}
          >
            <h2 className="font-editorial text-lg font-bold text-ivory flex items-center gap-2 border-b border-white/5 pb-3">
              <Scissors size={16} className="text-gold" />
              <span>2. Wardrobe &amp; Garment Fitting</span>
            </h2>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-stone font-bold">
                Fashion Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'dresses', label: 'Column Gowns' },
                  { id: 'shirts', label: 'Weighted Shirts' },
                  { id: 'outerwear', label: 'Trench Coats' },
                  { id: 'coords', label: 'Co-ords & Sets' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`p-2.5 rounded text-left border text-xs font-semibold transition-all ${
                      avatarState.selectedCategory === cat.id
                        ? 'border-gold bg-gold/15 text-gold'
                        : 'border-white/10 bg-obsidian text-stone hover:text-ivory'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Pieces in Active Category */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-stone font-bold">
                Select Signature Garment
              </label>
              <div className="space-y-2">
                {availableGarmentsInCategory.map((g) => {
                  const isSelected = activeGarment.id === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelectGarment(g)}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'border-gold bg-gold/15 text-ivory'
                          : 'border-white/5 bg-obsidian hover:border-white/20 text-stone'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-11 rounded overflow-hidden bg-charcoal flex-shrink-0">
                          <Image src={g.imageUrl} alt={g.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-ivory">{g.name}</p>
                          <p className="text-[11px] text-stone">{g.fitNotes}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gold text-right font-sans">
                        {formatINR(g.pricePaise)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fabric Color Swatches matching Catalog */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-stone font-bold">
                Color Variation ({activeGarment.colors.length} Available)
              </label>
              <div className="flex items-center gap-3">
                {activeGarment.colors.map((col) => (
                  <button
                    key={col.label}
                    type="button"
                    title={col.label}
                    onClick={() => setAvatarState({ ...avatarState, selectedColor: col.hex })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      avatarState.selectedColor === col.hex
                        ? 'border-gold scale-125 shadow-gold'
                        : 'border-white/20 hover:scale-110'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-wider text-stone font-bold">Available Size</span>
                <Link href="/size-guide" target="_blank" className="text-gold text-[11px] hover:underline">
                  Measurement Guide
                </Link>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setAvatarState({ ...avatarState, selectedSize: size })}
                    className={`py-2 text-xs font-bold rounded border transition-all ${
                      (avatarState.selectedSize || 'M') === size
                        ? 'border-gold bg-gold text-obsidian font-bold'
                        : 'border-white/10 bg-obsidian text-stone hover:text-ivory'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PARAMETER DOCK: SAVED LOOKS LIBRARY */}
          <div
            className={`p-6 rounded-xl bg-charcoal border border-white/10 space-y-4 shadow-xl ${
              mobileTab !== 'looks' && savedLooks.length === 0 ? 'hidden' : ''
            } ${mobileTab !== 'looks' ? 'hidden lg:block' : ''}`}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-editorial text-base font-bold text-ivory flex items-center gap-2">
                <Heart size={15} className="text-gold" />
                <span>Saved Atelier Looks ({savedLooks.length})</span>
              </h3>
              {savedLooks.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSavedLooks([]);
                    localStorage.removeItem('xevoras_saved_looks');
                  }}
                  className="text-[11px] text-stone hover:text-red-400"
                >
                  Clear All
                </button>
              )}
            </div>

            {savedLooks.length === 0 ? (
              <p className="text-xs text-stone italic text-center py-4">
                No looks saved yet. Configure an outfit and click &ldquo;Save Look&rdquo; above.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {savedLooks.map((look) => (
                  <div
                    key={look.id}
                    className="p-3 bg-obsidian rounded-lg border border-white/5 flex items-center justify-between text-xs hover:border-gold/30 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-ivory">{look.title}</p>
                      <p className="text-[10px] text-stone">
                        {look.date} &middot; {look.avatarState.heightCm}cm &middot;{' '}
                        {look.avatarState.gender}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAvatarState(look.avatarState)}
                        className="px-2.5 py-1 rounded bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-obsidian font-bold text-[10px] uppercase transition-colors"
                      >
                        Audition
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedLook(look.id)}
                        className="p-1 text-stone hover:text-red-400"
                        title="Delete look"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
