import fs from 'fs';
import path from 'path';
import { prisma } from '../db/prisma';

const CATALOGUE_FILE_PATH = path.join(process.cwd(), 'legacy_site/assets/data/catalogue.json');
const PUBLIC_CATALOGUE_PATH = path.join(process.cwd(), 'public/data/catalogue.json');
const ORDERS_LOG_PATH = path.join(process.cwd(), 'legacy_site/assets/data/orders.json');

export class CatalogueSyncService {
  /**
   * Synchronizes all Prisma database products into legacy_site/assets/data/catalogue.json
   */
  public static async syncPrismaToCatalogueJson(): Promise<boolean> {
    try {
      const dbProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          variants: true,
          media: { orderBy: { sortOrder: 'asc' } },
        },
      });

      // Read existing categories so we preserve the schema
      let categories: any[] = [];
      if (fs.existsSync(CATALOGUE_FILE_PATH)) {
        try {
          const raw = fs.readFileSync(CATALOGUE_FILE_PATH, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.categories)) {
            categories = parsed.categories;
          }
        } catch (e) {
          // ignore parse error, use default
        }
      }

      // If categories empty, fetch from DB
      if (categories.length === 0) {
        const dbCategories = await prisma.category.findMany();
        categories = dbCategories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          gender: c.gender,
          image: c.imageUrl || '/media/products/women-1.jpg',
        }));
      }

      // Format products to match catalogue.json schema
      const formattedProducts = dbProducts.map((p) => {
        const images = p.media && p.media.length > 0
          ? p.media.map((m) => ({ url: m.url, alt: m.altText || p.name }))
          : [{ url: '/media/products/women-1.jpg', alt: p.name }];

        const variants = p.variants && p.variants.length > 0
          ? p.variants.map((v) => ({
              sku: v.sku,
              size: v.size,
              colorName: v.colorName || 'Standard',
              colorHex: v.colorHex || '#17140f',
              stock: v.stockCount,
            }))
          : [
              { sku: `XV-${p.slug.toUpperCase()}-S`, size: 'S', colorName: 'Standard', colorHex: '#17140f', stock: 15 },
              { sku: `XV-${p.slug.toUpperCase()}-M`, size: 'M', colorName: 'Standard', colorHex: '#17140f', stock: 25 },
              { sku: `XV-${p.slug.toUpperCase()}-L`, size: 'L', colorName: 'Standard', colorHex: '#17140f', stock: 20 },
            ];

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          shortDescription: p.shortDescription || `${p.fabric || 'Artisanal'} · ${p.fit || 'Tailored'} · Always Rare`,
          gender: p.gender,
          pricePaise: p.pricePaise,
          compareAtPricePaise: p.compareAtPricePaise || Math.round(p.pricePaise * 1.5),
          material: p.material || p.fabric || 'Artisanal Handwoven Fabric',
          fit: p.fit || 'Tailored Fit',
          pattern: p.pattern || 'Refined Detailing',
          care: p.careInstructions || 'Dry clean recommended.',
          keywords: p.keywords || `${p.name.toLowerCase()} ${p.gender} xevoras`,
          featured: Boolean(p.featured),
          category: p.categoryId,
          categoryName: p.category?.name || 'Collection',
          images,
          variants,
          status: p.status.toLowerCase(),
          sourcingType: p.sourcingType || 'OWN',
          supplierSourceUrl: p.supplierSourceUrl || undefined,
          costPricePaise: p.costPricePaise || 0,
        };
      });

      const payload = {
        categories,
        products: formattedProducts,
        lastUpdated: new Date().toISOString(),
      };

      const jsonStr = JSON.stringify(payload, null, 2);

      // Write to legacy_site catalogue.json
      if (fs.existsSync(path.dirname(CATALOGUE_FILE_PATH))) {
        fs.writeFileSync(CATALOGUE_FILE_PATH, jsonStr, 'utf8');
      }

      // Also sync to public folder if exists
      const publicDir = path.dirname(PUBLIC_CATALOGUE_PATH);
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(PUBLIC_CATALOGUE_PATH, jsonStr, 'utf8');

      return true;
    } catch (err) {
      console.error('[CatalogueSyncService] Error syncing catalogue.json:', err);
      return false;
    }
  }

  /**
   * Logs placed orders to legacy_site/assets/data/orders.json for backup/disk visibility
   */
  public static logOrderToDisk(order: any) {
    try {
      let ordersList: any[] = [];
      if (fs.existsSync(ORDERS_LOG_PATH)) {
        try {
          const raw = fs.readFileSync(ORDERS_LOG_PATH, 'utf8');
          ordersList = JSON.parse(raw);
          if (!Array.isArray(ordersList)) ordersList = [];
        } catch (e) {
          ordersList = [];
        }
      }

      ordersList.unshift({
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt || new Date().toISOString(),
        customer: order.customer,
        items: order.items,
        totalPaise: order.totalPaise,
        status: order.status,
        paymentMethod: order.paymentMethod,
      });

      // Keep up to 500 recent orders
      if (ordersList.length > 500) {
        ordersList = ordersList.slice(0, 500);
      }

      const dir = path.dirname(ORDERS_LOG_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(ORDERS_LOG_PATH, JSON.stringify(ordersList, null, 2), 'utf8');
    } catch (err) {
      console.warn('[CatalogueSyncService] Could not write order to disk:', err);
    }
  }
}
