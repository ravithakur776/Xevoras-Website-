import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function cleanDemoData() {
  console.log('--- Cleaning XEVORAS Demo & Test Data ---');

  // 1. Delete all fake / demo orders
  const deletedShipments = await prisma.shipment.deleteMany({});
  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`✓ Deleted ${deletedOrders.count} demo orders, ${deletedOrderItems.count} items, ${deletedShipments.count} shipments.`);

  // 2. Delete test products created during automated testing
  const testProductSlugs = [
    'e2e-draft-velvet-embroidered-anarkali',
    'e2e-draft-velvet-embroidered-anarkali-1',
    'e2e-draft-velvet-embroidered-anarkali-2',
    'chikankari-handcrafted-tunic',
  ];

  // Find all test products matching patterns
  const testProducts = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'e2e-' } },
        { slug: { startsWith: 'xev-exclusive-raw-silk-dress' } },
        { slug: { startsWith: 'silk-evening-scarf' } },
        { slug: { in: testProductSlugs } },
      ],
    },
    select: { id: true, slug: true, name: true },
  });

  console.log(`Found ${testProducts.length} test/demo products to remove:`);
  for (const p of testProducts) {
    console.log(`  - Removing: ${p.name} (${p.slug})`);
    // Delete variants
    await prisma.productVariant.deleteMany({ where: { productId: p.id } });
    // Delete media
    await prisma.productMedia.deleteMany({ where: { productId: p.id } });
    // Delete reselling detail if any
    await prisma.resellingProduct.deleteMany({ where: { productId: p.id } }).catch(() => {});
    // Delete product
    await prisma.product.delete({ where: { id: p.id } });
  }

  // 3. Clean test import jobs
  const deletedJobs = await prisma.productImportJob.deleteMany({});
  console.log(`✓ Deleted ${deletedJobs.count} test import jobs.`);

  // 4. Clean test media assets from disk and DB
  const testMedia = await prisma.mediaAsset.findMany({
    where: {
      filename: { startsWith: 'e2e-' }
    }
  });

  for (const m of testMedia) {
    const filePath = path.join(process.cwd(), 'public', m.url);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`  - Unlinked test file: ${m.url}`);
      } catch (e) {}
    }
    await prisma.mediaAsset.delete({ where: { id: m.id } });
  }

  // Final count verification
  const remainingProducts = await prisma.product.count();
  const remainingOrders = await prisma.order.count();
  const remainingJobs = await prisma.productImportJob.count();
  console.log('\n--- Clean State Verification ---');
  console.log(`Products: ${remainingProducts}`);
  console.log(`Orders: ${remainingOrders} (Demo orders wiped)`);
  console.log(`Import Jobs: ${remainingJobs}`);

  await prisma.$disconnect();
}

cleanDemoData().catch(e => {
  console.error(e);
  process.exit(1);
});
