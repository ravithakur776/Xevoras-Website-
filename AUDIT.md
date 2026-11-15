# XEVORAS — Comprehensive Technical & UX Audit Report
**Date:** November 2026  
**Auditor:** Principal Product Designer, Creative Director & Senior Full-Stack Architect  
**Brand:** XEVORAS (Always Rare · हटके हमेशा)  
**Live Target:** `https://xevoras.com/index.html`  
**Status:** Audit Complete · Production Re-Architecture Required

---

## 1. Executive Summary

XEVORAS is an emerging contemporary fashion brand based out of Mumbai, India, operating on a high-potential "quiet luxury essentials meets festive apparel" product ethos. 

While the brand possesses a strong aesthetic emblem (a gold-embossed faceted "X" with dynamic slash geometry, tagline "ALWAYS RARE" and Hindi identity "हटके हमेशा"), the current implementation on `xevoras.com` is a rudimentary, fragile static HTML/ES5 JavaScript bundle running against a client-side Firebase v8 compat configuration. Critical enterprise e-commerce capabilities—including transactional inventory management, secure server-side order pipelines, modern fluid animations, 3D garment visualization, and AI virtual try-on—are either entirely absent or implemented as fragile prototypes in client-side script.

This document details the reconnaissance findings across frontend architecture, backend/APIs, data models, admin operations, Meesho reselling workflows, UX/UI quality, and security vulnerabilities.

---

## 2. Existing Stack & Infrastructure Inventory

| Layer | Existing Implementation | Findings & Vulnerabilities |
|---|---|---|
| **Frontend Framework** | Plain HTML5, Vanilla ES5 JS (No build pipeline, no bundler) | Zero component reusability, duplicated DOM across 20+ `.html` files, severe maintenance burden. |
| **Styling** | Monolithic `assets/css/styles.css` (89 KB, 3,800+ lines) | Unscoped CSS rules, inconsistent typography scales, non-standard breakpoints, lack of design tokens. |
| **Client Scripting** | `config.js`, `firebase.js`, `store.js`, `ux.js`, individual `pages/*.js` | Global `window.XEVORA` pollution, race conditions on DOM ready, duplicated event listeners. |
| **Backend & DB** | Firebase Firestore (`xevora-8784b`) via CDN compat SDK v8 | Client-side reads and writes directly from browser. No transactional safety, rate limiting, or server-side enforcement. |
| **Authentication** | Firebase Auth v8 (email/password) in client JS | No server-side session cookies or SSR protection. Admin routes protected only by client DOM toggles (`hidden` class). |
| **Hosting & CDN** | OpenResty reverse proxy / Fastly-edge CDN | Serving static HTML directly. Missing `robots.txt` (404) and `sitemap.xml` (404). Incomplete cache invalidation. |
| **Catalog Data** | Dual source: `assets/data/catalogue.json` fallback vs Firestore `products` collection | Fallback mechanism causes state drift between local JSON file and Firestore records. |
| **Media Assets** | Stored under `/media/` (e.g. `media/products/*.jpg`, `media/logo.png`) | Unoptimized JPG/PNG formats (up to 483 KB per image). No WebP/AVIF modern image pipelines. |

---

## 3. Route & Component Audit

### 3.1 Storefront Routes
- `index.html`: Contains hardcoded Diwali Dhamaka sale banner, seasonal hero, category chip strip, and product grids. Lacks CMS dynamic scheduling.
- `women.html` & `men.html`: Static landing pages with repetitive boilerplate code.
- `shop.html`: Filtering logic handles category and gender, but lacks multi-facet size, color, price range sliders, and active filter pill removals.
- `product.html`: Basic product detail page. Lacks interactive 360 viewer, 3D avatar preview, AI try-on modal, and true multi-variant matrix (e.g., color-dependent image galleries).
- `cart.html`: Stored in `localStorage` (`xevora_cart_v1`). Lacks server-side inventory locking and automatic promotion engine.
- `checkout.html`: Form posting directly to Firestore. Missing real merchant payment gateway abstraction (e.g., Razorpay/Cashfree/Stripe webhook verification).
- `account.html`: Minimal customer dashboard; lacks address management and order return workflows.
- `wishlist.html`: Stored purely in browser `localStorage`; does not sync across customer devices.
- `about.html`, `faq.html`, `contact.html`, `size-guide.html`, `terms.html`, `privacy.html`: Static boilerplate text.
- **Missing Routes:**
  - `/avatar-studio`: **Completely missing**.
  - `/virtual-try-on`: **Completely missing**.
  - Modern API routes (`/api/checkout`, `/api/try-on`, `/api/reselling`, `/api/admin/*`): **Completely missing**.

### 3.2 Admin Control Centre (`admin/index.html` & `admin.js`)
- `admin.js` is a monolithic 2,771-line ES5 file handling orders, catalog seeding, customer inspection, and rudimentary supplier reselling.
- **Security Vulnerability:** Protection is client-side (`renderGate()` checks `X.auth.currentUser` and hides/shows DOM). Any tech-savvy user can bypass the DOM gate or query Firestore directly using the public API credentials.
- **Variant Inventory:** Currently stored as an unindexed array inside product documents without atomic reservation on checkout.
- **Catalogue Seeding:** Clicking seed wipes or overwrites Firestore collections blindly without versioning or rollback capability.

---

## 4. Business & Feature Gap Analysis

| Feature Area | Current State | Required State (Target) |
|---|---|---|
| **Avatar Studio** | Non-existent (0%) | 3D Interactive studio (Three.js / React Three Fiber), avatar body customizer, 360-degree rotation, garment layering, save look, add-to-cart. |
| **AI Virtual Try-On** | Non-existent (0%) | Dedicated `/virtual-try-on` workflow, customer photo upload, FASHN AI API integration with provider abstraction, privacy consent, side-by-side comparison. |
| **Meesho Reselling** | Fragile URL scraper/preview in `admin.js` | Full `/admin/reselling` suite: Own vs Supplier products, automated margin math, CSV/Excel batch import, compliant supplier order workflow. |
| **Cart & Checkout** | LocalStorage + raw Firestore write | Dynamic cart drawer + persistent customer bag + server-side checkout + GST calculation + discount coupons + Payment Provider abstraction. |
| **Editorial UX** | Flat static blocks, harsh transitions | Cinematic opening reveal, GSAP smooth scroll, Framer Motion component micro-interactions, luxury typography. |
| **Brand Identity** | Logo PNG embedded at 44px with generic styling | Distinctive XEVORAS design system honoring the 3D gold emblem, obsidian luxury surfaces, editorial serif display typography, and Hindi identity. |
| **SEO & Performance** | Missing sitemap/robots, heavy uncompressed images | Next.js Metadata API, automated JSON-LD Schema (Product, Organization, BreadcrumbList), WebP/AVIF responsive image optimization. |

---

## 5. Security & Data Integrity Audit

1. **Client-Side Secret Exposure:** Firebase configuration is public; while standard for Firebase, client-side writes without rigorous Firestore security rules expose order collections to tampering (e.g. modifying `pricePaise` before submitting order).
2. **Payment Spoofing Risk:** Orders can be inserted with status `confirmed` directly from the client without cryptographic payment gateway signature verification.
3. **No Rate Limiting:** Form submissions (contact, newsletter, orders) have zero client or server rate limiting.
4. **Third-Party Marketplace Risk:** Attempting automated scraping of external marketplaces (e.g. Meesho) without official partner APIs violates terms of service. Sourcing must use compliant manual input and validated CSV imports.

---

## 6. Recommendations & Transition Strategy

A blind migration must be avoided. The transformation must:
1. Preserve all existing catalog products, descriptions, pricing, sizes, and media assets.
2. Preserve and enhance the authentic brand identity: logo, gold/obsidian/warm ivory palette, and Hindi tagline.
3. Migrate from static HTML to **Next.js 15 (App Router) + TypeScript + Tailwind CSS / Vanilla CSS Modules + Prisma ORM + Lucide Icons + Three.js / React Three Fiber + GSAP / Framer Motion**.
4. Introduce a provider-independent AI Virtual Try-On service and 3D Avatar Studio.
5. Provide a standalone, secure, full-fidelity Admin Control Centre and Meesho Reselling Manager.
