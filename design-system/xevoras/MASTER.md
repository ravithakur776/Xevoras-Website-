# XEVORAS — Master Design System (Source of Truth)
**Generated with UI/UX Pro Max Intelligence**
**Project:** XEVORAS Premium Fashion-Tech Platform
**Brand Statement:** ALWAYS RARE · हटके हमेशा

---

## 1. Product Archetype & Design Pattern
- **Archetype:** Luxury Contemporary Fashion E-Commerce + 3D Avatar Customization + AI Vision Try-On
- **Pattern:** Editorial Showcase & Conversational Conversion
- **Style:** Liquid Glass & Exaggerated Editorial Minimalism
- **Primary Canvas:** Obsidian Dark Canvas with Warm Ivory High-Contrast Inversion Blocks
- **CTA Hierarchy:** High-contrast Champagne Gold Foil `#B89560` buttons with deliberate hover physics

---

## 2. Color System & Semantic Tokens

```css
:root {
  /* Brand Core Palette */
  --xev-obsidian: #101010;
  --xev-charcoal: #1C1C1C;
  --xev-charcoal-light: #282828;
  --xev-warm-ivory: #F5F1E8;
  --xev-champagne-gold: #B89560;
  --xev-gold-hover: #CCA872;
  --xev-stone: #B9ADA1;
  --xev-clay: #704B40;

  /* Semantic Interface Tokens */
  --color-primary: #B89560;
  --color-primary-foreground: #101010;
  --color-background: #101010;
  --color-foreground: #F5F1E8;
  --color-surface: #1C1C1C;
  --color-surface-hover: #262626;
  --color-muted: #8E857C;
  --color-border: rgba(185, 173, 161, 0.16);
  --color-border-strong: rgba(184, 149, 96, 0.4);
  --color-ring: #B89560;
  --color-destructive: #EF4444;
  --color-success: #10B981;

  /* Liquid Glass Surfaces */
  --glass-bg: rgba(28, 28, 28, 0.75);
  --glass-border: 1px solid rgba(255, 255, 255, 0.08);
  --glass-blur: blur(20px);
}
```

---

## 3. Typography Architecture

- **Display Serif:** `Playfair Display`, `Cormorant Garamond`, serif  
  Used for: Brand heroes, collection editorial titles, luxury headers, category showcases.
- **Modern Sans:** `Plus Jakarta Sans`, `Inter`, -apple-system, sans-serif  
  Used for: Navigation, body copy, product specs, filters, shopping cart, admin tables.
- **Hindi Identity Font:** `Rozha One`, `Noto Serif Devanagari`, serif  
  Used for: "हटके हमेशा" and subtle cultural typographic motifs.

```css
.font-editorial {
  font-family: 'Playfair Display', Georgia, serif;
  letter-spacing: -0.02em;
}

.font-sans-ui {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  letter-spacing: -0.01em;
}

.font-hindi {
  font-family: 'Rozha One', 'Noto Serif Devanagari', serif;
}
```

---

## 4. Spacing, Elevation & Component System

- **Spacing Scale:** 4px (1), 8px (2), 12px (3), 16px (4), 24px (6), 32px (8), 48px (12), 64px (16), 96px (24), 128px (32)
- **Container Max-Width:** 1380px with 24px padding on mobile, 48px on tablet, 64px on desktop.
- **Border Radius:**
  - Micro-controls (pills, badges): `9999px`
  - Cards & Modals: `6px` – `12px` (restrained architectural luxury, never overly rounded like playful SaaS apps).
  - Buttons: `2px` – `4px` (sharp, tailored finish).

---

## 5. UI/UX Pro Max Compliance Checklist

- [x] No generic SaaS templates or AI gradients; bespoke fashion editorial palette.
- [x] Minimum 44×44px interactive tap target sizes on mobile.
- [x] WCAG AA contrast compliance (minimum 4.5:1 on text; gold accent carefully calibrated for readability).
- [x] Smooth hardware-accelerated animations (opacity and transform only).
- [x] Zero scroll hijacking; natural scrolling with smooth visual reveals.
- [x] Full `prefers-reduced-motion` compliance.
- [x] Consistent SVG icon system using Lucide icons exclusively.
- [x] Transparent and respectful AI virtual try-on privacy design.
