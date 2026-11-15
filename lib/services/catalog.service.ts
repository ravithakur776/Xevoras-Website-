import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/initialCatalog';
import { Category, Product } from '../types';
import { prisma } from '../db/prisma';

// In-memory fallback state
let categoriesStore: Category[] = [...INITIAL_CATEGORIES];
let productsStore: Product[] = [...INITIAL_PRODUCTS];

export class CatalogService {
  /**
   * Helper to format Prisma Product into standard client Product interface
   */
  private static formatPrismaProduct(p: any): Product {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription || undefined,
      gender: p.gender as any,
      pricePaise: p.pricePaise,
      compareAtPricePaise: p.compareAtPricePaise,
      costPricePaise: p.costPricePaise || 0,
      material: p.material || p.fabric || undefined,
      fit: p.fit || undefined,
      pattern: p.pattern || undefined,
      care: p.careInstructions || undefined,
      keywords: p.keywords || undefined,
      featured: Boolean(p.featured),
      isNewArrival: Boolean(p.isNewArrival),
      isTrending: Boolean(p.isTrending),
      status: p.status,
      category: p.categoryId,
      categoryName: p.category?.name || 'Collection',
      collectionId: p.collectionId || undefined,
      collectionName: p.collection?.name || undefined,
      sourcing: (p.sourcingType || 'OWN').toLowerCase() as any,
      supplierStatus: p.supplierStatus,
      supplierSourceUrl: p.supplierSourceUrl || undefined,
      supplierNotes: p.supplierNotes || undefined,
      seoTitle: p.seoTitle || undefined,
      seoDescription: p.seoDescription || undefined,
      images: p.media && p.media.length > 0
        ? p.media.map((m: any) => ({ url: m.url, alt: m.altText || p.name, isCover: m.isCover }))
        : [{ url: '/media/products/women-1.jpg', alt: p.name, isCover: true }],
      variants: p.variants && p.variants.length > 0
        ? p.variants.map((v: any) => ({
            id: v.id,
            sku: v.sku,
            size: v.size,
            colorName: v.colorName,
            colorHex: v.colorHex || undefined,
            stock: v.stockCount,
            costPricePaise: v.costPricePaise || 0,
            sellingPricePaise: v.sellingPricePaise || p.pricePaise,
            status: v.status || 'ACTIVE',
            availabilityMode: v.availabilityMode || 'OWN_VERIFIED',
          }))
        : [
            { sku: `XV-${p.slug.toUpperCase()}-S`, size: 'S', colorName: 'Noir', stock: 10 },
            { sku: `XV-${p.slug.toUpperCase()}-M`, size: 'M', colorName: 'Noir', stock: 15 },
            { sku: `XV-${p.slug.toUpperCase()}-L`, size: 'L', colorName: 'Noir', stock: 10 },
          ],
      createdAt: p.createdAt ? p.createdAt.toISOString() : undefined,
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : undefined,
    };
  }

  /**
   * Fetches live published products directly from the database in real-time
   */
  public static async getLiveProducts(): Promise<Product[]> {
    try {
      const dbProducts = await prisma.product.findMany({
        where: { status: 'PUBLISHED' },
        include: {
          category: true,
          collection: true,
          variants: true,
          media: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return dbProducts.map((p) => this.formatPrismaProduct(p));
    } catch (err) {
      console.warn('Database query error in getLiveProducts:', err);
      return [];
    }
  }

  /**
   * Fetches a single live product by slug or id from the database
   */
  public static async getLiveProductBySlug(slug: string): Promise<Product | undefined> {
    try {
      const p = await prisma.product.findFirst({
        where: {
          OR: [{ slug }, { id: slug }],
          status: 'PUBLISHED', // Only published pieces viewable by customers
        },
        include: {
          category: true,
          collection: true,
          variants: true,
          media: { orderBy: { sortOrder: 'asc' } },
        },
      });

      if (p) {
        return this.formatPrismaProduct(p);
      }
      return undefined;
    } catch (err) {
      console.warn('Database slug query error:', err);
      return undefined;
    }
  }

  public static async getLiveFeaturedProducts(limit: number = 4): Promise<Product[]> {
    const list = await this.getLiveProducts();
    const featured = list.filter((p) => p.featured);
    return (featured.length > 0 ? featured : list).slice(0, limit);
  }

  public static async getLiveNewArrivals(limit: number = 4): Promise<Product[]> {
    const list = await this.getLiveProducts();
    const newItems = list.filter((p) => p.isNewArrival);
    return (newItems.length > 0 ? newItems : list).slice(0, limit);
  }

  public static async getLiveTrendingProducts(limit: number = 4): Promise<Product[]> {
    const list = await this.getLiveProducts();
    const trending = list.filter((p) => p.isTrending);
    return (trending.length > 0 ? trending : list).slice(0, limit);
  }

  // Synchronous methods for SSR fallbacks
  public static getAllCategories(): Category[] {
    return categoriesStore;
  }

  public static getCategoryBySlug(slug: string): Category | undefined {
    return categoriesStore.find((c) => c.slug === slug || c.id === slug);
  }

  public static getAllProducts(): Product[] {
    return productsStore.filter((p) => p.status !== 'DRAFT' && p.status !== 'ARCHIVED');
  }

  public static getFeaturedProducts(limit: number = 4): Product[] {
    const list = this.getAllProducts();
    const feat = list.filter((p) => p.featured);
    return (feat.length > 0 ? feat : list).slice(0, limit);
  }

  public static getNewArrivals(limit: number = 4): Product[] {
    const list = this.getAllProducts();
    const news = list.filter((p) => p.isNewArrival);
    return (news.length > 0 ? news : list).slice(0, limit);
  }

  public static getTrendingProducts(limit: number = 4): Product[] {
    return this.getAllProducts().slice(0, limit);
  }

  public static getProductBySlug(slug: string): Product | undefined {
    return productsStore.find((p) => (p.slug === slug || p.id === slug) && p.status !== 'DRAFT' && p.status !== 'ARCHIVED');
  }

  public static getProductsByGender(gender: 'women' | 'men'): Product[] {
    return this.getAllProducts().filter((p) => p.gender === gender || p.gender === 'unisex');
  }

  public static addProduct(product: Product): Product {
    productsStore = [product, ...productsStore];
    return product;
  }

  public static updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = productsStore.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    productsStore[idx] = { ...productsStore[idx], ...updates, updatedAt: new Date().toISOString() };
    return productsStore[idx];
  }

  public static deleteProduct(id: string): boolean {
    const initialLen = productsStore.length;
    productsStore = productsStore.filter((p) => p.id !== id);
    return productsStore.length < initialLen;
  }
}
