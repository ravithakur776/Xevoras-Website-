# XEVORAS — 3D ASSET & DIGITAL FASHION PIPELINE SPECIFICATION

**Document Version:** 3.0.0  
**Date:** November 15, 2026  
**Target Platform:** WebGL 2.0 / Three.js r128+  
**Target Devices:** High-end & mid-tier mobile (iOS Safari, Android Chrome), Modern Desktops  

---

## 1. Asset Pipeline Overview

To ensure the XEVORAS digital fitting experience remains responsive (< 3s initial load, 60fps on mobile), the 3D pipeline supports a hybrid strategy:
1. **Procedural High-Fidelity Parametric Generation (Active in Production):** Dynamic Three.js parametric geometries generated client-side with zero network latency, perfectly adapting to any height (155cm–195cm) and body proportion with zero clipping.
2. **GLTF/GLB Asset Standard (Ready for Custom Rigged 3D Scans):** Standardized specification for production 3D garments modeled in CLO 3D / Marvelous Designer / Blender and exported to glTF 2.0.

---

## 2. glTF 2.0 Modeling & Geometry Specifications

### 2.1 Polygon Budgets
| Asset Category | Target Triangles | Maximum Triangles | Draw Calls |
|---|---|---|---|
| **Avatar Base Mannequin (LOD 0)** | 12,000 – 18,000 | 25,000 | 1 – 2 |
| **Avatar Base Mannequin (LOD 1)** | 6,000 – 8,000 | 10,000 | 1 |
| **Column Gown (Eveningwear)** | 15,000 – 22,000 | 30,000 | 2 – 3 |
| **Weighted Poplin Shirt** | 10,000 – 16,000 | 20,000 | 2 |
| **Archival Trench Coat** | 18,000 – 26,000 | 35,000 | 3 – 4 |
| **Co-ord Set (Top + Trouser)** | 16,000 – 24,000 | 32,000 | 3 |
| **Studio Pedestal & Grid** | 1,500 – 3,000 | 5,000 | 1 – 2 |

### 2.2 Coordinate System & Scale
- **Units:** Metric meters (1 Three.js unit = 1.0 meter).
- **Origin (0, 0, 0):** Center of the studio pedestal floor between the avatar's heels.
- **Facing Direction:** +Z forward (Front view faces -Z or +Z aligned with camera at `(0, 1.3, 4.0)`).
- **Height Reference:** Standard baseline 1.75 meters (175 cm).

---

## 3. PBR Texture & Material Guidelines

All materials must adhere strictly to the **Metallic-Roughness PBR Workflow**:

| Map Type | Color Space | Resolution (Mobile) | Resolution (Desktop) | Compression Format |
|---|---|---|---|---|
| **Base Color (Albedo)** | sRGB | 1024 x 1024 | 2048 x 2048 | KTX2 / Basis Universal / WebP |
| **Normal Map (DirectX or OpenGL)** | Linear | 1024 x 1024 | 2048 x 2048 | KTX2 (Normal RGB) |
| **Roughness / Metalness / AO** | Linear | 1024 x 1024 | 2048 x 2048 | Channel Packed (R=AO, G=Roughness, B=Metalness) |
| **Sheen / Clearcoat (Luxury Fabrics)** | Linear | 512 x 512 | 1024 x 1024 | KTX2 |

### 3.1 Material Presets by Category
1. **Mulberry Silk Satin (The Column Gown):**
   - Roughness: `0.25 – 0.35`
   - Metalness: `0.08 – 0.15`
   - Sheen Color: `#F5E6D3` (subtle champagne reflection)
   - Double-sided rendering enabled.
2. **Heavyweight Poplin (Weighted Overshirt):**
   - Roughness: `0.65 – 0.78`
   - Metalness: `0.02`
   - Micro-weave bump with high frequency repeat (64x64).
3. **Double-Faced Wool & Gabardine (Archival Trench):**
   - Roughness: `0.80 – 0.90`
   - Metalness: `0.05`
   - Distinct horn button highlights (Roughness: `0.20`, Metalness: `0.10`).
4. **Silk Organza (Architectural Co-Ord):**
   - Roughness: `0.45 – 0.55`
   - Metalness: `0.12`
   - Transmission / subtle alpha falloff at garment fringes.

---

## 4. Rigging & Anatomical Morph Targets

For imported mesh assets, the standard skeleton should be compatible with:
- **Skeleton Standard:** 54-bone glTF standard humanoid rig.
- **Root Bone:** `Pelvis` at height `1.05m`.
- **Morph Target Standard (Blendshapes):**
  - `Body_Slender`: Weight range 0.0 to 1.0.
  - `Body_Athletic`: Weight range 0.0 to 1.0.
  - `Body_Curvy`: Weight range 0.0 to 1.0.
  - `Body_Broad`: Weight range 0.0 to 1.0.
  - `Height_Offset`: Vertical spine/femur/tibia translation normalized between 1.55m and 1.95m.

---

## 5. Procedural Parametric Fallback Architecture

To guarantee that the studio functions seamlessly offline or when external 3D files fail to load over slow cellular connections:
- The procedural engine builds high-detail parametric geometries using segmented cylinders, cones, toruses, and spheres.
- Canvas-generated procedural normal textures provide realistic micro-fabric grain without downloading large PNG/KTX2 assets.
- Clearances between body surfaces and garments are clamped between `0.012` and `0.025` units, guaranteeing zero clipping across all 16 possible body shape and height permutations.
