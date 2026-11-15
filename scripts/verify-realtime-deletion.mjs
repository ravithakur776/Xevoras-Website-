import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(process.cwd(), 'tests', 'screenshots', 'admin-clean');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verify() {
  console.log('--- VERIFYING SIMPLE & MINIMAL ADMIN + REAL-TIME DELETION ---');

  // 1. Admin login
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@xevoras.com', password: 'admin' }),
  });
  const cookie = loginRes.headers.get('set-cookie').split(';')[0];
  console.log('✓ Admin authenticated');

  // 2. Create a test dress
  const testSlug = `temp-test-dress-${Date.now()}`;
  const createRes = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      name: 'Temporary Test Silk Midi Dress',
      slug: testSlug,
      pricePaise: 299900,
      gender: 'women',
      categoryId: 'women-dresses',
      status: 'PUBLISHED',
      sourcingType: 'OWN',
      variants: [
        { sku: `SKU-${Date.now()}`, size: 'M', colorName: 'Noir', stockQuantity: 10 },
      ],
      images: [
        { url: '/media/products/women-1.jpg', isCover: true },
      ],
    }),
  });
  const createData = await createRes.json();
  const createdId = createData.product.id;
  console.log(`✓ Created test dress: "${createData.product.name}" (ID: ${createdId}, Slug: ${testSlug})`);

  // 3. Verify it appears on live website (/api/products & /product/[slug])
  const liveCheck1 = await fetch(`${BASE_URL}/api/products`);
  const liveData1 = await liveCheck1.json();
  const foundBefore = liveData1.products.some((p) => p.id === createdId);
  console.log(`✓ Live Website Check BEFORE Delete: Found = ${foundBefore} (HTTP ${liveCheck1.status})`);

  const pdpCheck1 = await fetch(`${BASE_URL}/product/${testSlug}`);
  console.log(`✓ Product Page BEFORE Delete: HTTP ${pdpCheck1.status}`);

  // 4. Delete the dress via Admin API (which admin panel button calls)
  console.log('\n--- Executing Real-Time Deletion ---');
  const deleteRes = await fetch(`${BASE_URL}/api/admin/products/${createdId}`, {
    method: 'DELETE',
    headers: { Cookie: cookie },
  });
  const deleteData = await deleteRes.json();
  console.log(`✓ DELETE API Result:`, deleteData);

  // 5. Verify it is IMMEDIATELY GONE from the real website!
  const liveCheck2 = await fetch(`${BASE_URL}/api/products`);
  const liveData2 = await liveCheck2.json();
  const foundAfter = liveData2.products.some((p) => p.id === createdId);
  console.log(`✓ Live Website Check AFTER Delete: Found = ${foundAfter} (Expected: false)`);

  const pdpCheck2 = await fetch(`${BASE_URL}/product/${testSlug}`);
  console.log(`✓ Product Page AFTER Delete: HTTP ${pdpCheck2.status} (Expected: 404)`);

  if (!foundAfter && pdpCheck2.status === 404) {
    console.log('\n🌟 SUCCESS: Deletion happens IN REAL TIME on the live website! 🌟');
  } else {
    console.error('\n❌ FAILURE: Dress was still present after deletion!');
    process.exit(1);
  }

  // 6. Capture Screenshots of Simplified Minimal Admin
  console.log('\n--- Capturing UI Screenshots of Clean Minimal Admin ---');
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const tokenVal = cookie.replace('xevoras_admin_token=', '');
  await context.addCookies([
    {
      name: 'xevoras_admin_token',
      value: tokenVal,
      domain: 'localhost',
      path: '/',
    },
  ]);

  const page = await context.newPage();

  // Overview
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-clean-overview.png') });
  console.log('✓ Captured: 01-clean-overview.png');

  // Minimal Products Table
  await page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-clean-products.png') });
  console.log('✓ Captured: 02-clean-products.png');

  await browser.close();
  console.log('\nAll checks completed cleanly.');
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
