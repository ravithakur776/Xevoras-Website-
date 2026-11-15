# XEVORAS — ADMIN CONTROL CENTRE & PRODUCT MANAGEMENT SYSTEM
## Flagship Fashion-Tech E-Commerce Infrastructure Report

**Brand:** XEVORAS · Always Rare · हटके हमेशा  
**Live Platform:** https://xevoras.com/index.html  
**System Version:** XEVORAS Admin Engine v2.0  
**Status:** **PRODUCTION READY · 18/18 E2E TESTS PASSED**

---

## 1. Executive Summary

A complete, production-grade **Admin Control Centre** has been engineered and seamlessly integrated into the XEVORAS fashion-tech commerce platform. The system equips the luxury maison with end-to-end catalogue governance, automated margin analytics, multi-angle imagery storage, variant matrices, and dual-sourcing fulfillment workflows:

1. **Meesho Source Link Import Workflow** (`/admin/products/import/meesho`): An 8-step editorial import suite allowing staff to paste any authenticated Meesho product link, persist the supplier origin URL in the database, calculate net contribution margins in real-time, upload high-definition photography, and publish directly to the live storefront or save as an internal reserve draft.
2. **Manual Clothing & Dress Studio** (`/admin/products/new/manual`): A bespoke couture creation console capturing complete haute-couture specifications: fabric composition, occasion, silhouette fit, sleeve style, neckline architecture, multi-color/size variant SKUs, and packaging costs.
3. **Instant Live Storefront Synchronization**: Dynamic Prisma queries ensure any product saved or published in `/admin` immediately reflects across the live catalogue (`/shop`, `/women`, `/men`, homepage new arrivals/trending feeds, and direct product detail pages `/product/[slug]`).
4. **Strict E-Commerce Compliance & Security**: Adheres strictly to modern web safety and platform terms: automated HTML scraping, scraping bypasses, or CAPTCHA solving are strictly prohibited. Instead, an enterprise **Provider Adapter pattern** handles URL sanitization, SSRF protection, database origin linking, and manual detail verification with partner API hooks.

---

## 2. Complete Admin Route Taxonomy

All 11 admin navigation hubs have been fully implemented with Obsidian luxury styling (`#101010`), Champagne Gold accents (`#B89560`), Cormorant Garamond typography, and responsive controls:

| Route | Hub Description | Key Capabilities |
| :--- | :--- | :--- |
| `/admin` | **Executive Overview** | Real-time database metrics: Total Products, Published, Drafts, Meesho-sourced, Own inventory, Out-of-stock, Pending verification, Fast Action Portals. |
| `/admin/products` | **Product Matrix** | Complete search, status filters (All, Published, Draft, Archived), sourcing filters (All, Own, Meesho), stock status filters, duplicate, edit, delete, publish toggle. |
| `/admin/products/new` | **Creation Chooser** | Dual-portal entry: Card 1 for Meesho Source Link Import, Card 2 for Manual Own Dress & Clothing Creation. |
| `/admin/products/import/meesho` | **Meesho Import Studio** | 8-step guided import: URL validation, SSRF checks, ProductImportJob creation, luxury editorial rewrite, image upload, variant matrix, margin calculation, instant publish. |
| `/admin/products/new/manual` | **Manual Creation** | Sections A–G: Core Identity, Garment Specifications, Multi-Image Photography, Variants & SKUs, Financial & Margin Engine, Curation & Display, Save/Publish. |
| `/admin/products/[id]/edit` | **Product Editor** | In-place live editor for garment specifications, pricing, imagery reordering, variant stock, and publication toggle. |
| `/admin/inventory` | **Inventory & Sourcing Desk** | 7-step fulfillment protocol visualizer, supplier verification status updates, inline variant stock adjustments. |
| `/admin/categories` | **Category Directory** | Taxonomy manager for luxury departments and gender navigation. |
| `/admin/collections` | **Curated Collections** | Editorial drop organizer for seasonal runways, bridal couture, and limited capsules. |
| `/admin/media` | **Media Library & Vault** | High-resolution photography repository with drag-and-drop upload, automatic disk storage in `public/uploads/products/`, copy URL, and size tracking. |
| `/admin/settings` | **Platform Configuration** | Brand identities, currency rules, free shipping thresholds, target margin percentages, and partner API credentials. |
| `/admin/reselling` | **Reselling Operations Desk** | B2B supplier fulfillment console, tracking links, supplier costs, and customer dispatch monitoring. |

---

## 3. Database Architecture & Prisma Schema

The SQLite schema (`prisma/schema.prisma`) was synchronized using `prisma db push` and `prisma generate`, preserving all existing data while expanding product capabilities:

### Extended `Product` Model
- `brand`: Default `'XEVORAS'`
- `productType`: Specific apparel category (e.g. `'Anarkali Kurta Set'`, `'Couture Gown'`)
- `fabric`: Luxury composition (`'Silk Velvet'`, `'Mulberry Raw Silk'`)
- `pattern`: Fabric texture (`'Embroidered'`, `'Solid Structured'`)
- `fit`: Tailoring silhouette (`'Flared Tailored'`, `'Slim Atelier'`)
- `occasion`: Editorial use case (`'Festive & Bridal Sangeet'`, `'Black Tie Gala'`)
- `sleeveType`: Tailoring specification (`'Full Sleeve'`, `'Sleeveless'`)
- `neckType`: Neckline cut (`'Sweetheart'`, `'Asymmetric Sculpted'`)
- `costPricePaise`: Supplier base procurement cost in paise
- `shippingCostPaise`: Dedicated courier expense allocation in paise
- `packagingCostPaise`: Custom luxury black-box packaging cost in paise
- `otherExpensesPaise`: Ancillary buffer allocation
- `supplierStatus`: `'NOT_VERIFIED' | 'VERIFICATION_PENDING' | 'AVAILABLE' | 'OUT_OF_STOCK' | 'TEMPORARILY_UNAVAILABLE'`
- `supplierSourceUrl`: Direct persistent supplier URL for one-click reordering
- `supplierNotes`: Internal procurement notes on delivery SLAs and ratings
- `supplierVerificationDate`: ISO timestamp of latest QC check
- `collectionId`: Foreign key to `Collection`

### Added Models
- **`ProductImportJob`**: Tracks every Meesho source link registered, supplier platform, audit timestamp, and import status (`DRAFT_CREATED`, `COMPLETED`, `FAILED`).
- **`MediaAsset`**: Catalogues high-resolution image uploads with persistent disk URLs, MIME types, file sizes, and dimensions.
- **`Collection`**: Groupings for runway edits, bridal drops, and seasonal capsules.
- **`ProductVariant` Enhancements**: Added `costPricePaise`, `sellingPricePaise`, `variantImageUrl`, `status`, and `availabilityMode`.

---

## 4. Financial & Real-Time Margin Engine

To prevent unprofitable pricing on supplier-sourced or manufactured pieces, the admin studio incorporates a real-time margin calculation engine:

$$\text{Total Procurement Cost} = \text{Base Cost} + \text{Packaging Cost} + \text{Shipping Cost} + \text{Other Expenses}$$

$$\text{Net Contribution Margin} = \text{Selling Price} - \text{Total Procurement Cost}$$

$$\text{Gross Margin \%} = \left( \frac{\text{Net Contribution Margin}}{\text{Selling Price}} \right) \times 100$$

### Verified Example (E2E Test TC-10):
- **Base Cost:** ₹450 (45,000 paise)
- **Luxury Packaging:** ₹40 (4,000 paise)
- **Courier Shipping:** ₹70 (7,000 paise)
- **Total Landed Cost:** **₹560** (56,000 paise)
- **Selling Price:** **₹1,899** (189,900 paise)
- **Net Margin:** **₹1,339** (70.5% Gross Contribution)

---

## 5. Security & E-Commerce Compliance Protocol

### Anti-Scraping Compliance
In strict adherence to international e-commerce platform terms of service and developer guidelines:
1. Automated headless browser scraping of Meesho product pages is **strictly disabled**.
2. CAPTCHA solving, bot bypasses, and account credential spoofing are **strictly prohibited**.
3. Sourcing URLs are validated for protocol (`https://`) and authorized domain (`*.meesho.com`), sanitized of marketing trackers, and saved persistently in `ProductImportJob.sourceUrl` and `Product.supplierSourceUrl`.
4. The system presents a compliant provider adapter interface with explicit manual curation fallback: *"Manual product details required. Paste title, fabric, and pricing from the verified supplier listing."*

### SSRF Protection
All incoming URLs pass through strict regex domain assertions rejecting:
- `http://` unencrypted requests
- Localhost (`127.0.0.1`, `localhost`, `0.0.0.0`)
- Private RFC 1918 IPv4 spaces (`10.x.x.x`, `172.16.x.x`, `192.168.x.x`)
- Foreign unapproved domains

### Role-Based Admin Auth
The admin control centre is protected by HMAC SHA-256 session signatures. Unauthenticated requests to `/api/admin/*` are immediately halted with `401 Unauthorized`.

---

## 6. Automated End-to-End Test Suite Results

The comprehensive test suite (`tests/run-admin-e2e.mjs`) was executed against the running Next.js production server. All **18 test scenarios passed with 100% compliance**:

```
=================================================================
   XEVORAS — ADMIN CONTROL CENTRE & MEESHO IMPORT E2E TEST SUITE 
=================================================================

--- 1. AUTHENTICATION & SECURITY CONTROLS ---
 [PASS] TC-01: Admin Login & Session Verification (Token generated: xevoras_admin_token=eyJ1c2VySW...)
 [PASS] TC-02: Access Protection on /api/admin/* (Unauthenticated request correctly returned 401 Unauthorized)

--- 2. MEESHO ADAPTER & URL SANITIZATION ---
 [PASS] TC-03: Meesho URL Validation & Security Rejection (Non-HTTPS & foreign SSRF blocked; valid Meesho link accepted)
 [PASS] TC-04: Source Link Saved in Database (ProductImportJob) (Job ID: cmwhq43lo0000or597y33dr37, sourceUrl saved persistently)

--- 3. MEDIA & PHOTOGRAPHY STORAGE ---
 [PASS] TC-07: Image Upload API & Storage Persistence (Image saved to /uploads/products/..., file exists on disk: true)
 [PASS] TC-08: Image Cover Setting & Reordering (Primary cover flagged with displayOrder 0, secondary at order 1)

--- 4. PRODUCT MATRIX & MARGIN CALCULATIONS ---
 [PASS] TC-09: Variant Creation with Unique SKUs (3 variants defined: XEV-DRAFT-S, XEV-DRAFT-M, XEV-DRAFT-L)
 [PASS] TC-10: Price & Real-Time Margin Calculations (Cost: ₹450 + Pack: ₹40 + Ship: ₹70 = ₹560. Sell: ₹1899 => Margin: ₹1339 (70.5%))

--- 5. DRAFT WORKFLOW & STOREFRONT VISIBILITY ---
 [PASS] TC-05: Draft Product Creation (Draft product created with ID: cmwhq43md0003or59cz5fjqbr, status="DRAFT")
 [PASS] TC-11: Save as Draft Exclusion from Storefront (Draft confirmed absent from live /api/products catalog)

--- 6. MANUAL PRODUCT CREATION & INSTANT PUBLISH ---
 [PASS] TC-06: Manual Dress & Clothing Data Entry (Structured garment specifications, fabric, occasion, and variants verified)
 [PASS] TC-12: Publish Product Directly on XEVORAS (Product published with ID: cmwhq43n2000gor593a0pq1w7, status="PUBLISHED")

--- 7. LIVE STOREFRONT SYNCHRONIZATION ---
 [PASS] TC-13: Storefront Reflection (Instant Catalog Sync) (Newly published piece immediately retrieved from live /api/products)
 [PASS] TC-14: Product Detail Page Resolution (/product/[slug]) (PDP loaded successfully for /product/xev-exclusive-raw-silk-dress-... with title, variants, and imagery)

--- 8. PRODUCT LIFECYCLE & INVENTORY CONTROLS ---
 [PASS] TC-15: Edit Product Details via /admin/products/[id] (Price updated to ₹7,200, tagline updated)
 [PASS] TC-16: Duplicate Product Functionality (Cloned to new product: "XEVORAS Atelier Raw Silk Gala Gown (Copy)", status="DRAFT")
 [PASS] TC-17: Inventory & Supplier Status Desk (Supplier status set to AVAILABLE and stock updated)

--- 9. BULK CATALOG OPERATIONS ---
 [PASS] TC-18: CSV Catalogue Export & Batch Import (CSV exported and batch import parsed and created 1 product)

--- 10. BROWSER UI VALIDATION & SCREENSHOT CAPTURE ---
 [CAPTURE] Captured: 01-admin-overview.png
 [CAPTURE] Captured: 02-admin-products-matrix.png
 [CAPTURE] Captured: 03-admin-add-product-choice.png
 [CAPTURE] Captured: 04-admin-meesho-import-studio.png
 [CAPTURE] Captured: 05-admin-manual-clothing-form.png
 [CAPTURE] Captured: 06-admin-media-library.png
 [CAPTURE] Captured: 07-live-shop-with-published-product.png
 [CAPTURE] Captured: 08-live-product-detail-page.png

=================================================================
   E2E RESULTS SUMMARY: 18 PASSED / 0 FAILED (18 TOTAL)
=================================================================
```
