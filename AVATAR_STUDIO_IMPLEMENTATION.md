# XEVORAS — 3D AVATAR STUDIO IMPLEMENTATION ARCHITECTURE

**Document Version:** 3.0.0 Production Release  
**Date:** November 15, 2026  
**Architect:** Principal Three.js Engineer & Digital Fashion Technical Director  
**Route:** `/avatar-studio`  

---

## 1. Architectural Overview

The XEVORAS 3D Avatar Studio has been transformed into a digital fashion showroom. Built on **Next.js 15 App Router**, **Three.js r128+**, **WebGL 2.0**, and **Tailwind CSS**, the experience balances interactive 3D rendering with luxury e-commerce product discovery.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       XEVORAS 3D AVATAR STUDIO                             │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 3D WebGL Canvas Viewport             │ Customization Dock & Commerce Sync   │
│  ├── ACESFilmic Tone Mapping         │  ├── Presentation Gender (M / F)     │
│  ├── 3-Point Fashion Studio Lighting │  ├── Body Shape (Slender/Athletic/…) │
│  ├── Anatomical Mannequin Sculpt     │  ├── Height Slider (155cm – 195cm)   │
│  ├── Tailored Zero-Clipping Garment  │  ├── Skin Tone Swatches              │
│  ├── Smooth Slerp Camera Presets     │  ├── Garment Catalog & Color Tints   │
│  ├── 360° Automated Turntable Orbit  │  ├── Real Available Size Selection   │
│  └── Atelier Floor Pedestal          │  └── Add to Bag & Persistent Looks   │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 2. Three.js Scene Graph & Environment

### 2.1 Studio Environment & Lighting
- **Atmospheric Palette:** Deep atelier tone `#0E0E0F` with tone mapping exposure set to `1.15`.
- **Lighting Rig:**
  1. **Warm Key Light:** High-right directional light `(3.2, 4.2, 3.5)` in Champagne Gold Warmth (`#FAF3EB`, intensity `1.85`), casting soft shadows via PCFSoftShadowMap (`1024x1024`).
  2. **Cool Fill Light:** Low-left directional light `(-3.2, 3.2, 2.2)` in Soft Ice Blue (`#D0DEEB`, intensity `0.75`).
  3. **Sharp Rim Light:** High-rear directional light `(0, 4.2, -3.5)` in Signature Champagne Gold (`#B89560`, intensity `2.2`) providing crisp silhouette separation against the dark background.
  4. **Runway Spotlight:** Gentle overhead spotlight `(0, 5.2, 0)` illuminating the studio pedestal.
- **Lighting Modes:**
  - `Atelier`: Balanced luxury showroom warmth.
  - `Runway`: High-contrast dramatic spotlighting with intense rim definition.
  - `Noir`: Minimalist shadows with luminous gold silhouette edges.

### 2.2 Studio Floor & Pedestal
- Primary floor disc (`CircleGeometry`, 3.6m radius) with soft shadow reception.
- Outer concentric beveled ring (`RingGeometry`, 2.35m radius) in metallic brushed champagne gold (`#B89560`, metalness `0.85`, roughness `0.25`).
- Inner circular runway turntable disc (`1.2m` radius) defining the model's footprint.

---

## 3. Anatomical Mannequin Modeling

The procedural mannequin engine in [`AvatarStudioCanvas.tsx`](file:///Users/ravithakur/Desktop/Xevoras%20Website/components/avatar/AvatarStudioCanvas.tsx) avoids rigid primitives in favor of sculpted fashion proportions:

### 3.1 Head & Facial Sculpt
- Contoured cranial sphere (`0.142` male / `0.134` female) with stylized jawline plane (`ConeGeometry` inverted) defining the chin angle.
- Sleek minimalist hair contour positioned naturally at the crown.

### 3.2 Anatomical Silhouette Gendering
- **Female Hourglass Model:**
  - Chest contour: `0.178 * bodyScaleX`.
  - Tapered waist: `0.126 * bodyScaleX`.
  - Flared hips: `0.192 * bodyScaleX`.
  - Contoured bust geometry with dual anatomical sphere accents (`0.085`).
  - Slender throat: `0.046` top radius to `0.062` base radius.
- **Male V-Taper Model:**
  - Broad shoulder span: `0.245 * bodyScaleX`.
  - Chest width: `0.24 * bodyScaleX`.
  - Straight streamlined hips: `0.165 * bodyScaleX`.
  - Muscular athletic neck: `0.064` top radius to `0.082` base radius.

### 3.3 Dynamic Scaling & Contrapposto Stance
- Natural runway stance with foot turnout, relaxed arms angled along the torso (`0.11` radian rotation), sculpted calves, and minimalist studio footwear platforms.
- Proportions scale dynamically with `heightCm` normalized around standard 175cm (`heightCm / 175`).

---

## 4. Realistic Tailored Garment Experience

### 4.1 PBR Materials & Micro-Weave Normal Texture
Instead of flat albedo colors, fabrics utilize procedural micro-textures generated on an offscreen HTML5 canvas and bound as `bumpMap` (repeating `16x16`):
- **Mulberry Silk Satin (Gowns):** Low roughness (`0.32`), subtle metallic sheen (`0.18`), and high specular reflection.
- **Oxford Poplin (Shirts):** Medium-high roughness (`0.72`), tactile micro-weave bump scale (`0.004`), and matte finish.
- **Double-Faced Wool (Coats):** High roughness (`0.82`), structured drape, and rich fiber absorption.

### 4.2 Garment Details by Category
1. **Column Gowns (The Column Gown / Fleur Bias Midi):**
   - Tailored sweetheart bodice with satin gold piping at the neckline.
   - Fluted floor-sweeping column skirt with gentle flare.
   - Flowing back drape train and metallic satin gold hem ring.
2. **Weighted Shirts (Oxford Dress Shirt / Indigo Workshirt):**
   - Structured turn-down tailored collar and placket stripe.
   - 4 micro horn/gold buttons down the front.
   - Tailored sleeves along arms and high-waist pleated trousers with sharp front creases.
3. **Archival Trench Coats (Azure Trench / Nocturne Overcoat):**
   - Wide folded notch lapels with 3D rotation.
   - Cinched waist belt with metallic champagne buckle ring.
   - 6 double-breasted buttons arranged in 3 symmetrical rows.
4. **Co-ords & Sets (Solstice Track Set):**
   - Architectural cropped blazer / corset top with square neckline.
   - High-waist palazzo trousers with wide-leg flare and waist sash ring.

### 4.3 Zero-Clipping Guarantee
Clearances are mathematically enforced:
- Inner garments (dresses, shirts, tops): `skinRadius + 0.014`.
- Outerwear (trench coats): `skinRadius + 0.035`.
- As the user modifies height or body shape (`slender`, `athletic`, `curvy`, `broad`), all garment vertices scale in lockstep with the avatar's body.

---

## 5. Camera Control & Presentation

- **Smooth Interpolation (Lerping):** Switching views smoothly interpolates `camera.position` and `controls.target` toward the target vectors at a rate of `0.08` per frame, eliminating jarring visual cuts.
- **Cinematic Presets:**
  - `Front`: `(0, 1.25, 3.8)` — Balanced frontal runway view.
  - `Profile`: `(3.6, 1.25, 0)` — 90° lateral inspection of drape and spine posture.
  - `Back`: `(0, 1.25, -3.8)` — Rear inspection of gown train, back seams, and collar.
  - `Close-Up`: `(0, 1.48, 1.95)` — Framing neckline, fabric micro-texture, and collar details.
  - `Full`: `(0, 1.15, 4.5)` — Floor-to-head framing showing shoes and hem sweep.
- **360° Automated Turntable Orbit:** One-click toggle slowly orbits the camera around the Y-axis (`0.0065 rad/frame`). Interacting with the canvas immediately pauses the turntable to give full control back to the user.

---

## 6. Commerce Integration & State Persistence

1. **Direct Catalog Alignment:**
   - Every 3D garment maps to a real product in [`initialCatalog.ts`](file:///Users/ravithakur/Desktop/Xevoras%20Website/lib/data/initialCatalog.ts).
   - "Add Look to Bag" passes the exact product ID (`the-column-gown`, `oxford-dress-shirt`, `azure-trench`, `solstice-track-set`), real SKU, selected size (`XS`–`XXL`), color label, and price in paise to the cart store.
2. **Persistent Saved Looks Library:**
   - Saves avatar configurations to `localStorage` (`xevoras_saved_looks`).
   - Saved looks can be re-auditioned with a single click or deleted from the library drawer.
3. **Deep-Link Shareable URLs:**
   - "Share Look" encodes gender, body shape, height, category, garment ID, color, and size into URL parameters (e.g., `?gender=female&body=curvy&height=175&category=dresses&garment=the-column-gown&color=%238a1f2b&size=M`).
   - Visiting a shared URL instantly reconstructs the exact configured look.
