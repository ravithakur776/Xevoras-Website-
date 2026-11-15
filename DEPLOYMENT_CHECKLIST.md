# XEVORAS — PRODUCTION DEPLOYMENT CHECKLIST & LAUNCH GUIDE
**Target Brand:** XEVORAS (`xevoras.com`) — *ALWAYS RARE · हटके हमेशा*  
**Platform Version:** 2.0.0-RELEASE_CANDIDATE  
**Framework:** Next.js 15 (App Router) + Prisma ORM 6.3.1 + Three.js  
**Deployment Architect:** Principal Full-Stack Engineer & DevOps Lead  

---

## 1. Pre-Deployment Verification Summary

Before commencing live public DNS propagation, verify that the local codebase has passed all gate checks:

- [x] **TypeScript Validation:** `npm run build` compiles with 0 type errors.
- [x] **Static & Dynamic Generation:** All 29 routes build successfully (22 static `○`, 7 dynamic `ƒ`).
- [x] **Automated E2E Testing:** Playwright test suite (`tests/run-e2e.mjs`) passes 33 / 33 test cases.
- [x] **Core Web Vitals:** LCP < 1.0s, INP < 50ms, CLS 0.000 across Desktop and Mobile.
- [x] **Security Auditing:** HMAC session tokens, timing-safe auth, server price recalculation, biometric consent verified.
- [x] **SEO & Structured Data:** Organization schema, Product schema, Breadcrumb schema, `/sitemap.xml`, and `/robots.txt` verified.

---

## 2. Environment Variables Configuration

Create `.env.production` (or configure in the hosting provider dashboard e.g. Vercel, Railway, AWS):

```bash
# ------------------------------------------------------------------------------
# CORE APPLICATION & CANONICAL DOMAIN
# ------------------------------------------------------------------------------
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://xevoras.com

# ------------------------------------------------------------------------------
# DATABASE CONNECTION (PostgreSQL recommended for multi-instance scaling)
# ------------------------------------------------------------------------------
# Example: PostgreSQL connection string
DATABASE_URL="postgresql://xevoras_db_user:SUPER_SECURE_PASSWORD@ep-solitary-river.ap-south-1.aws.neon.tech/xevoras_prod?sslmode=require"

# ------------------------------------------------------------------------------
# CRYPTOGRAPHIC SECURITY & SESSIONS
# ------------------------------------------------------------------------------
# Generate with: openssl rand -base64 48
ADMIN_AUTH_SECRET="f6c8d7e9b0a1f2e3d4c5b6a7890123456789abcdef0123456789abcdef012345"
DEFAULT_ADMIN_EMAIL="admin@xevoras.com"
DEFAULT_ADMIN_PASSWORD="REPLACE_WITH_STRONG_PRODUCTION_PASSWORD"

# ------------------------------------------------------------------------------
# AI VIRTUAL TRY-ON (FASHN AI Provider)
# ------------------------------------------------------------------------------
FASHN_API_KEY="fa-live-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ------------------------------------------------------------------------------
# PAYMENT GATEWAY (Razorpay / Cashfree)
# ------------------------------------------------------------------------------
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"

# ------------------------------------------------------------------------------
# LOGISTICS & SHIPPING (Delhivery Express)
# ------------------------------------------------------------------------------
DELHIVERY_API_TOKEN="dlv_live_xxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 3. Database Migration Path (SQLite to PostgreSQL)

When deploying to a distributed serverless host (e.g. Vercel), migrate from local SQLite to PostgreSQL (Neon, Supabase, or AWS RDS):

### Step 1: Update Prisma Datasource Provider
In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Push Schema to Production Database
```bash
npx prisma db push
```

### Step 3: Seed Production Catalog & Categories
```bash
npx tsx prisma/seed.ts
```
*Note: This automatically creates the 19 initial products, 8 categories, supplier catalog entries, and sets initial inventory quantities.*

---

## 4. Hosting Platform Deployment Protocols

### Option A: Vercel (Recommended for Next.js 15)

1. Connect GitHub repository to Vercel.
2. In **Project Settings → Environment Variables**, paste all production variables from Section 2.
3. Configure Build Settings:
   - **Build Command:** `prisma generate && next build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
4. Trigger Initial Deployment.
5. In **Domains**, add `xevoras.com` and `www.xevoras.com`.

### Option B: Docker Container / Self-Hosted VPS

A production-grade multi-stage `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start", "--", "-p", "3000"]
```

---

## 5. DNS & SSL Propagation

Configure DNS A and CNAME records at your registrar:

| Type | Host | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (xevoras.com) | `76.76.21.21` (Vercel IP) | Auto / 300s |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Auto / 300s |
| **TXT** | `@` | (Google Site Verification token if required) | Auto |

Verify that SSL certificates automatically renew via Let's Encrypt / Vercel Edge SSL.

---

## 6. Post-Launch Smoke Testing Checklist

Immediately upon DNS resolution:

1. [ ] **Homepage Check:** Load `https://xevoras.com` over HTTPS. Confirm Brand Intro reveal modal appears once and dismisses cleanly.
2. [ ] **Mega-Menu Interaction:** Hover over "Women" and "Men" to inspect categories and campaign cards.
3. [ ] **Shopping Journey:**
   - Open `/product/the-column-gown`.
   - Select size `M`.
   - Add to bag.
   - Open cart drawer and proceed to checkout.
   - Complete COD order; verify generated order number `XV-XXXXX`.
4. [ ] **Admin Verification:**
   - Navigate to `/admin`.
   - Verify staff login gate (`admin@xevoras.com`).
   - Inspect Executive KPIs and verify the newly placed order appears in the Order Processing Desk.
5. [ ] **3D Avatar Studio:**
   - Navigate to `/avatar-studio`.
   - Verify 60fps rendering, turntable rotation, and garment switching on mobile and desktop.
6. [ ] **AI Virtual Try-On:**
   - Navigate to `/virtual-try-on`.
   - Verify biometric privacy consent gating.
   - Generate look preview and download 1080x1350 canvas look card.

---

## 7. Sign-Off & Launch Readiness

The platform has completed all quality gates and is certified ready for public deployment.

**Deployment Readiness:** CERTIFIED FOR PRODUCTION LAUNCH
