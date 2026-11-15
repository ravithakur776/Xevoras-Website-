# XEVORAS — SEARCH ENGINE OPTIMIZATION (SEO) & STRUCTURED DATA REPORT
**Document Version:** 1.0.0  
**Target Domain:** `https://xevoras.com`  
**Evaluation Standard:** Google Search Central E-Commerce Guidelines & Schema.org Specification  
**Audit Date:** November 2026  
**Auditor:** Principal E-Commerce SEO Architect  

---

## 1. Executive Summary

The XEVORAS web platform has been engineered to maximize organic search discoverability, rich snippet eligibility on Google Search and Google Discover, and social sharing fidelity. All requirements for modern luxury e-commerce SEO—including JSON-LD structured data, dynamic XML sitemaps, robots protocol governance, OpenGraph cards, and canonical URL normalization—are fully implemented and verified.

---

## 2. Technical SEO Architecture

### 2.1 Metadata Foundation & Base URL
Configured via Next.js 15 App Router metadata API in `app/layout.tsx`:
- `metadataBase`: `https://xevoras.com`
- `title.template`: `%s | XEVORAS — Always Rare`
- `title.default`: `XEVORAS — Always Rare | Premium Contemporary Fashion & 3D Avatar Studio`
- `description`: Editorial, keyword-rich narrative emphasizing luxury garments, archival craftsmanship, 3D avatar fitting, and complimentary express delivery across India.

### 2.2 Robots Protocol Governance (`app/robots.ts`)
The `robots.txt` file is dynamically generated at the root (`/robots.txt`):
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://xevoras.com/sitemap.xml',
  };
}
```
**Benefits:**
- Protects administrative back-office desks (`/admin/`) and internal database endpoints (`/api/`) from search engine indexing.
- Directs search spiders to the canonical XML sitemap.

### 2.3 Comprehensive Dynamic Sitemap (`app/sitemap.ts`)
The sitemap (`/sitemap.xml`) indexes all indexable public URLs:
- Homepage (`/`, priority `1.0`, `daily`)
- Category Collections (`/shop`, `/women`, `/men`, priority `0.9`, `daily`)
- Innovative Fashion-Tech Studios (`/avatar-studio`, `/virtual-try-on`, priority `0.85`, `weekly`)
- Product Detail Pages (all active product slugs e.g. `/product/the-column-gown`, priority `0.8`, `weekly`)
- Utility & Sizing Pages (`/size-guide`, priority `0.7`, `monthly`)
- Legal & Compliance Pages (`/legal/privacy`, `/legal/shipping`, `/legal/returns`, `/legal/terms`, priority `0.5`, `monthly`)

---

## 3. Schema.org JSON-LD Structured Data

### 3.1 Organization Schema (`app/layout.tsx`)
Injected globally into the `<head>` of every page:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "XEVORAS",
  "url": "https://xevoras.com",
  "logo": "https://xevoras.com/media/brand/xevoras-monogram.png",
  "slogan": "ALWAYS RARE · हटके हमेशा",
  "description": "Premium contemporary fashion maison featuring signature archival silhouettes, 3D avatar fitting, and AI virtual try-on.",
  "sameAs": [
    "https://instagram.com/xevoras",
    "https://twitter.com/xevoras"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-98201-55443",
    "contactType": "Customer Service",
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi"]
  }
}
```

### 3.2 Product & BreadcrumbList Schema (`app/product/[slug]/page.tsx`)
Injected dynamically on all product detail pages to power Google Rich Results (Price, Currency, In-Stock badge, Image carousels):
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "The Column Gown",
  "description": "Architectural floor-length column gown crafted from heavy double-satin with a sculpted neckline and discreet back slit.",
  "image": ["https://xevoras.com/media/products/women-1.jpg"],
  "sku": "XV-W-01",
  "brand": {
    "@type": "Brand",
    "name": "XEVORAS"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": "4290",
    "availability": "https://schema.org/InStock",
    "url": "https://xevoras.com/product/the-column-gown",
    "seller": {
      "@type": "Organization",
      "name": "XEVORAS"
    }
  }
}
```

---

## 4. OpenGraph & Social Sharing Cards

- `og:site_name`: `XEVORAS`
- `og:locale`: `en_IN`
- `og:type`: `website` / `product`
- `og:title`: Rich contextual title for each view.
- `og:image`: High-resolution 1200 × 630 branded card featuring the gold XEVORAS monogram.
- `twitter:card`: `summary_large_image`

---

## 5. SEO Readiness Sign-Off

The platform strictly conforms to modern search engine guidelines and semantic standards, guaranteeing immediate indexing readiness upon public DNS propagation.

**SEO Status:** VERIFIED & READY FOR INDEXING
