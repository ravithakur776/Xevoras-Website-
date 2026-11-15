import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding XEVORAS database...');

  const catData = JSON.parse(fs.readFileSync('./legacy_site/assets/data/catalogue.json', 'utf8'));

  // 1. Categories
  for (const cat of catData.categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        gender: cat.gender,
        imageUrl: cat.image,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        gender: cat.gender,
        imageUrl: cat.image,
      },
    });
  }
  console.log('Categories seeded:', catData.categories.length);

  // 2. Products and Variants
  for (const prod of catData.products) {
    const isNew = prod.slug.includes('gown') || prod.slug.includes('trench') || prod.slug.includes('trouser');
    
    // Create/update product
    const p = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        description: prod.description,
        shortDescription: prod.shortDescription,
        gender: prod.gender,
        pricePaise: prod.pricePaise,
        compareAtPricePaise: prod.compareAtPricePaise || null,
        material: prod.material,
        fit: prod.fit,
        pattern: prod.pattern,
        careInstructions: prod.care,
        keywords: prod.keywords,
        featured: Boolean(prod.featured),
        isNewArrival: isNew,
        categoryId: prod.category,
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        gender: prod.gender,
        pricePaise: prod.pricePaise,
        compareAtPricePaise: prod.compareAtPricePaise || null,
        material: prod.material,
        fit: prod.fit,
        pattern: prod.pattern,
        careInstructions: prod.care,
        keywords: prod.keywords,
        featured: Boolean(prod.featured),
        isNewArrival: isNew,
        categoryId: prod.category,
        sourcingType: 'OWN',
      },
    });

    // Media
    for (let i = 0; i < prod.images.length; i++) {
      const img = prod.images[i];
      await prisma.productMedia.create({
        data: {
          productId: p.id,
          url: img.url,
          altText: img.alt || prod.name,
          sortOrder: i,
          isCover: i === 0,
        },
      });
    }

    // Variants
    for (const v of prod.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          stockCount: v.stock,
        },
        create: {
          productId: p.id,
          sku: v.sku,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          stockCount: v.stock,
        },
      });
    }
  }
  console.log('Products & variants seeded:', catData.products.length);

  // 3. Supplier Source & Reselling Items
  const meeshoSource = await prisma.supplierSource.upsert({
    where: { id: 'src_meesho_partner' },
    update: {},
    create: {
      id: 'src_meesho_partner',
      name: 'Meesho Direct & Partner Workshops',
      contactName: 'Wholesale Desk Mumbai',
      contactPhone: '+91 86796 89174',
      notes: 'Authorized wholesale vendor catalogue',
    },
  });

  // Reselling product
  const resellProd = await prisma.product.upsert({
    where: { slug: 'chikankari-handcrafted-tunic' },
    update: {},
    create: {
      id: 'resell_meesho_kurta',
      name: 'Chikankari Handcrafted Tunic',
      slug: 'chikankari-handcrafted-tunic',
      description: 'Artisan embroidered lucknowi tunic cut from light cotton mull.',
      gender: 'women',
      pricePaise: 189000,
      categoryId: 'women-co-ords',
      sourcingType: 'ON_DEMAND',
      featured: true,
      variants: {
        create: [
          { sku: 'MSH-CK-491-S', size: 'S', colorName: 'Ivory Gold', stockCount: 99 },
          { sku: 'MSH-CK-491-M', size: 'M', colorName: 'Ivory Gold', stockCount: 99 },
          { sku: 'MSH-CK-491-L', size: 'L', colorName: 'Ivory Gold', stockCount: 99 },
        ],
      },
      media: {
        create: [
          { url: '/media/products/women-5.jpg', altText: 'Chikankari Tunic', isCover: true },
        ],
      },
      resellingDetail: {
        create: {
          supplierSourceId: meeshoSource.id,
          supplierSku: 'MSH-CK-491',
          supplierUrl: 'https://meesho.com',
          supplierCostPaise: 65000,
          estShippingCostPaise: 7000,
          estPackagingCostPaise: 3000,
          fulfilmentNotes: 'Verify stock on partner portal before ordering',
        },
      },
    },
  });
  console.log('Reselling products seeded.');

  // 4. Initial Orders (Clean production start: real orders only)
  console.log('Orders table ready for real customer checkouts.');

  // 5. CMS Content
  await prisma.cMSContent.upsert({
    where: { key: 'announcement' },
    update: {},
    create: {
      key: 'announcement',
      valueJson: JSON.stringify({
        text: '✨ Complimentary Express Delivery on All Orders across India · Cash on Delivery Available',
        active: true,
      }),
    },
  });

  // 6. Coupons
  await prisma.coupon.upsert({
    where: { code: 'RARE10' },
    update: {},
    create: {
      code: 'RARE10',
      discountPercent: 10,
      minOrderPaise: 100000,
      active: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'XEVORAS20' },
    update: {},
    create: {
      code: 'XEVORAS20',
      discountPercent: 20,
      minOrderPaise: 200000,
      active: true,
    },
  });
  console.log('Coupons seeded.');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
