# XEVORAS — Brand Design System & Token Specification
**Style Paradigm:** Exaggerated Editorial Minimalism · Liquid Glass Accents · Luxury Contemporary Fashion  
**Brand Philosophy:** ALWAYS RARE · हटके हमेशा  
**Design Intelligence:** UI/UX Pro Max Compliant

---

## 1. Visual Hierarchy & Brand Aesthetic

XEVORAS marries European high-fashion editorial discipline with Indian luxury cultural resonance. The visual tone is grounded, architectural, restrained, and unmistakably premium. Gold is treated as fine jewelry—a purposeful, high-contrast accent—never as an overwhelming visual glaze.

```
       [ OBSIDIAN LUXURY CANVAS #101010 ]
                      │
  ┌───────────────────┴───────────────────┐
  ▼                                       ▼
[ EDITORIAL SERIF TYPOGRAPHY ]    [ CHAMPAGNE GOLD ACCENT #B89560 ]
"The Column Gown"                 Foil badges, subtle rings, primary CTAs
                      │
  ┌───────────────────┴───────────────────┐
  ▼                                       ▼
[ STONE & WARM IVORY SURFACES ]   [ LIQUID GLASS PANELS ]
#F5F1E8 / #B9ADA1 editorial cards Translucent drawers with backdrop-blur
```

---

## 2. Color System & Semantic Tokens

| Token Name | Hex Code | Role | Context & Usage |
|---|---|---|---|
| `--color-obsidian` | `#101010` | Dominant Dark Canvas | Main background, header in dark mode, deep luxury contrast. |
| `--color-charcoal` | `#1C1C1C` | Elevated Dark Surface | Product cards, navigation drawer background, modal containers. |
| `--color-warm-ivory`| `#F5F1E8` | Editorial Light Canvas | Editorial text sections, high-contrast badges, light-mode background. |
| `--color-gold` | `#B89560` | Signature Brand Accent | Badges ("ALWAYS RARE"), button hovers, subtle borders, selection rings. |
| `--color-gold-light`| `#D6B584` | Highlight Gold | Active states, hover states, shimmer gradients. |
| `--color-stone` | `#B9ADA1` | Muted Structure | Secondary text, borders, hairline dividers, inactive icon strokes. |
| `--color-clay` | `#704B40` | Warm Earth Accent | Tagline highlights, editorial story banners, terracotta notes. |
| `--color-success` | `#10B981` | Positive Feedback | In-stock pill, order confirmed badge, margin profit indicator. |
| `--color-danger` | `#EF4444` | Critical Alert | Low stock alert, form errors, cancellation state. |

---

## 3. Typography Hierarchy

```css
/* Display & Editorial Headings */
font-family: var(--font-serif), 'Playfair Display', 'Cormorant Garamond', Georgia, serif;

/* Functional Body, Navigation & Data */
font-family: var(--font-sans), 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;

/* Hindi Brand Identity */
font-family: var(--font-hindi), 'Rozha One', 'Noto Serif Devanagari', serif;
```

### Type Scale
- **Display 1 (Hero Title):** `clamp(2.75rem, 6vw, 5.5rem)` · Letter-spacing: `-0.03em` · Line-height: `1.05`
- **Display 2 (Section Title):** `clamp(2rem, 4vw, 3.25rem)` · Letter-spacing: `-0.02em` · Line-height: `1.15`
- **Heading 1:** `2rem` (32px) · Letter-spacing: `-0.02em` · Line-height: `1.2`
- **Heading 2:** `1.5rem` (24px) · Letter-spacing: `-0.01em` · Line-height: `1.3`
- **Heading 3:** `1.125rem` (18px) · Letter-spacing: `0` · Line-height: `1.4`
- **Body Large:** `1.125rem` (18px) · Line-height: `1.6`
- **Body Regular:** `1rem` (16px) · Line-height: `1.5`
- **Caption / Meta:** `0.75rem` (12px) · Letter-spacing: `0.08em` · Text-transform: `uppercase`

---

## 4. Elevation, Borders & Glassmorphism

```css
:root {
  /* Hairline Borders */
  --border-subtle: 1px solid rgba(255, 255, 255, 0.08);
  --border-gold: 1px solid rgba(184, 149, 96, 0.4);
  --border-light: 1px solid rgba(0, 0, 0, 0.08);

  /* Liquid Glass Surfaces */
  --glass-bg: rgba(28, 28, 28, 0.72);
  --glass-border: 1px solid rgba(255, 255, 255, 0.12);
  --glass-blur: blur(16px);

  /* Shadows */
  --shadow-subtle: 0 4px 20px -2px rgba(0, 0, 0, 0.25);
  --shadow-gold: 0 8px 32px -4px rgba(184, 149, 96, 0.2);
  --shadow-deep: 0 20px 48px -8px rgba(0, 0, 0, 0.6);

  /* Radius */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-pill: 9999px;
}
```

---

## 5. Button & Interactive Systems

1. **Primary Luxury Button (`.btn-gold`):**
   - Background: Gradient from `#B89560` to `#9E7B49`.
   - Text: Obsidian (`#101010`), Font-weight: 600, Letter-spacing: `0.05em`.
   - Hover: Transform `translateY(-1px)`, box-shadow `var(--shadow-gold)`.
2. **Editorial Outline Button (`.btn-outline`):**
   - Border: `1px solid rgba(245, 241, 232, 0.3)`.
   - Background: Transparent.
   - Hover: Border color `#B89560`, Text `#B89560`.
3. **Ghost / Text Button (`.btn-ghost`):**
   - Clean underlined transition on hover with smooth 200ms ease.

---

## 6. Motion & Animation Principles

- **Framework Harmony:** GSAP for cinematic scroll choreography and page entry reveals; Framer Motion for interactive micro-states, cart drawers, and modal transitions.
- **Duration & Curves:**
  - Micro-interactions (hover, active): `150ms – 250ms`, `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Drawer & Modal transitions: `350ms – 450ms`, `cubic-bezier(0.25, 1, 0.5, 1)`.
  - Hero image reveals: `800ms – 1200ms`, `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Accessibility:** Full support for `prefers-reduced-motion: reduce`. All transforms and continuous rotations gracefully collapse to instant or simple opacity fades.
