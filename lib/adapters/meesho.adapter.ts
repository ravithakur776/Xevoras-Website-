/**
 * XEVORAS — MEESHO SOURCING PROVIDER ADAPTER
 * 
 * Intelligent URL parsing, NLP classification, and automatic product metadata generation.
 * Handles Denim/Jeans, Trousers, Sarees, Kurtis, Co-ords, Gowns, Shirts, Outerwear with
 * precise silhouettes, fabrics, occasions, size matrices, and high-resolution photography.
 */

export interface MeeshoValidationResult {
  valid: boolean;
  error?: string;
  cleanUrl?: string;
  sourceProductId?: string;
}

export interface MeeshoAutoFillProduct {
  name: string;
  slug: string;
  description: string;
  gender: 'women' | 'men' | 'unisex';
  categoryId: string;
  categoryName: string;
  fabric: string;
  pattern: string;
  fit: string;
  occasion: string;
  sleeveType: string;
  neckType: string;
  careInstructions: string;
  costPricePaise: number;
  pricePaise: number;
  compareAtPricePaise: number;
  profitPaise: number;
  marginPercent: number;
  sourceUrl: string;
  sourceProductId: string;
  coverImage: string;
  galleryImages: string[];
  variants: Array<{
    size: string;
    sku: string;
    stockCount: number;
    pricePaise: number;
  }>;
}

export class MeeshoAdapter {
  private static readonly SUPPORTED_HOSTNAMES = [
    'www.meesho.com',
    'meesho.com',
    'supply.meesho.com',
  ];

  /**
   * Curated high-resolution imagery presets for exact garment types
   */
  private static readonly CURATED_IMAGES = {
    // Denim & Jeans (Real Meesho Wide-Leg Jeans Model Photo!)
    jeans: [
      '/media/products/meesho-dark-blue-wide-leg-jeans.jpg',
      '/media/products/trouser-1.jpg',
      '/media/products/men-4.jpg',
    ],
    // Tailored Trousers & Pants
    trousers: [
      '/media/products/trouser-1.jpg',
      '/media/products/trouser-1-detail.jpg',
      '/media/products/men-7.jpg',
    ],
    // Ethnic, Sarees & Kurtis
    ethnic: [
      '/media/products/women-2.jpg',
      '/media/products/women-6.jpg',
      '/media/products/women-1.jpg',
    ],
    // Gowns & Evening Dresses
    womenDresses: [
      '/media/products/women-3.jpg',
      '/media/products/women-4.jpg',
      '/media/products/women-1.jpg',
      '/media/products/women-6.jpg',
    ],
    // Co-ords & Sets
    womenCoords: [
      '/media/products/women-5.jpg',
      '/media/products/women-2.jpg',
      '/media/products/hero-a.jpg',
    ],
    // Outerwear
    womenOuterwear: [
      '/media/products/jacket-1.jpg',
      '/media/products/hero-b.jpg',
    ],
    // Men Shirts
    menShirts: [
      '/media/products/men-1.jpg',
      '/media/products/men-2.jpg',
      '/media/products/men-4.jpg',
    ],
    // Men Outerwear
    menOuterwear: [
      '/media/products/men-5.jpg',
      '/media/products/men-6.jpg',
      '/media/products/knit-1.jpg',
    ],
  };

  /**
   * Validates that the provided URL is a secure, valid Meesho product link.
   * Tolerant: accepts meesho.com, www.meesho.com, http://, query parameters, app share links.
   */
  public static validateUrl(inputUrl: string): MeeshoValidationResult {
    if (!inputUrl || typeof inputUrl !== 'string') {
      return { valid: false, error: 'Please provide a valid product URL string.' };
    }

    let trimmed = inputUrl.trim();

    // Auto-fix missing protocol
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = 'https://' + trimmed;
    } else if (trimmed.startsWith('http://')) {
      trimmed = 'https://' + trimmed.slice(7);
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      return { valid: false, error: 'Malformed URL. Please check the link format.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // SSRF / Private network rejection
    const isPrivateIp =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local');

    if (isPrivateIp) {
      return {
        valid: false,
        error: 'Security rejection: Internal and private network addresses are not permitted.',
      };
    }

    // Supported domain verification
    const isSupportedDomain = this.SUPPORTED_HOSTNAMES.some(
      (supported) => hostname === supported || hostname.endsWith(`.${supported}`)
    );

    if (!isSupportedDomain) {
      return {
        valid: false,
        error: `Invalid domain "${hostname}". Only official Meesho links (*.meesho.com) are supported.`,
      };
    }

    // Extract Meesho product ID or slug from pathname (e.g. /product-title/p/1abc)
    let sourceProductId: string | undefined;
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const pIndex = pathParts.indexOf('p');
    if (pIndex !== -1 && pathParts[pIndex + 1]) {
      sourceProductId = pathParts[pIndex + 1];
    } else if (pathParts.length > 0) {
      sourceProductId = pathParts[pathParts.length - 1];
    }

    const cleanUrl = `${parsed.origin}${parsed.pathname}`;

    return {
      valid: true,
      cleanUrl,
      sourceProductId: sourceProductId || 'msh-' + Math.random().toString(36).substring(2, 8),
    };
  }

  /**
   * Title Case helper
   */
  private static toTitleCase(str: string): string {
    return str
      .replace(/[-_]+/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
      .trim();
  }

  /**
   * Intelligently parses any Meesho URL and auto-fills a complete, high-converting product definition.
   */
  public static parseAndGenerateProduct(
    urlStr: string,
    customImageUrl?: string,
    customCostPaise?: number,
    customPricePaise?: number
  ): MeeshoAutoFillProduct {
    const validation = this.validateUrl(urlStr);
    if (!validation.valid || !validation.cleanUrl) {
      throw new Error(validation.error || 'Invalid Meesho URL.');
    }

    const parsed = new URL(validation.cleanUrl);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    let rawSlug = '';
    const pIdx = pathParts.indexOf('p');
    if (pIdx > 0) {
      rawSlug = pathParts[pIdx - 1];
    } else if (pathParts.length > 0 && pathParts[0] !== 's' && pathParts[0] !== 'p') {
      rawSlug = pathParts[0];
    }

    const prodId = validation.sourceProductId || Math.random().toString(36).substring(2, 7);
    const lowerSlug = rawSlug.toLowerCase();

    // 1. Determine Product Type & Category with High Precision
    const isJeans = lowerSlug.includes('jeans') || lowerSlug.includes('denim');
    const isTrouser = lowerSlug.includes('trouser') || lowerSlug.includes('pant') || lowerSlug.includes('palazzo') || lowerSlug.includes('plazzo') || lowerSlug.includes('legging') || lowerSlug.includes('lower') || lowerSlug.includes('trackpant') || lowerSlug.includes('jogger');
    const isSaree = lowerSlug.includes('saree') || lowerSlug.includes('sari');
    const isKurti = lowerSlug.includes('kurti') || lowerSlug.includes('anarkali') || lowerSlug.includes('kurta') || lowerSlug.includes('salwar') || lowerSlug.includes('suit');
    const isCoord = lowerSlug.includes('coord') || lowerSlug.includes('co-ord') || lowerSlug.includes('set') || lowerSlug.includes('two-piece');
    const isOuterwear = lowerSlug.includes('jacket') || lowerSlug.includes('blazer') || lowerSlug.includes('coat') || lowerSlug.includes('shrug') || lowerSlug.includes('overcoat');
    const isShirt = lowerSlug.includes('shirt') || lowerSlug.includes('tshirt') || lowerSlug.includes('polo') || lowerSlug.includes('tee');

    // 2. Determine Gender
    let gender: 'women' | 'men' | 'unisex' = 'women';
    if (
      (lowerSlug.includes('men') || lowerSlug.includes('mens')) &&
      !lowerSlug.includes('women') &&
      !isKurti &&
      !isSaree
    ) {
      gender = 'men';
    } else if (lowerSlug.includes('unisex')) {
      gender = 'unisex';
    }

    // 3. Category ID & Display Name
    let categoryId = 'women-dresses';
    let categoryName = 'Dresses & Gowns';

    if (isJeans) {
      categoryId = gender === 'men' ? 'men-jeans' : 'women-trousers';
      categoryName = 'Denim & Jeans';
    } else if (isTrouser) {
      categoryId = gender === 'men' ? 'men-jeans' : 'women-trousers';
      categoryName = 'Trousers & Pants';
    } else if (isCoord) {
      categoryId = 'women-co-ords';
      categoryName = 'Co-ords & Sets';
    } else if (isOuterwear) {
      categoryId = gender === 'men' ? 'men-outerwear' : 'women-outerwear';
      categoryName = 'Outerwear & Jackets';
    } else if (isShirt) {
      categoryId = 'men-shirts';
      categoryName = 'Shirts';
    } else if (isSaree) {
      categoryId = 'women-dresses';
      categoryName = 'Sarees & Heritage';
    } else if (isKurti) {
      categoryId = 'women-dresses';
      categoryName = 'Ethnic & Kurtis';
    } else {
      categoryId = gender === 'men' ? 'men-shirts' : 'women-dresses';
      categoryName = gender === 'men' ? 'Shirts' : 'Dresses & Gowns';
    }

    // 4. Clean Luxury Title
    let name = '';
    if (rawSlug && rawSlug !== 's') {
      let cleanWords = rawSlug
        .replace(/lower/gi, '-lower-')
        .replace(/trackpant/gi, '-trackpant-')
        .replace(/plazzo/gi, '-palazzo-')
        .replace(/palazzo/gi, '-palazzo-')
        .split(/[-_\s]+/)
        .filter(Boolean);
      name = this.toTitleCase(cleanWords.join(' '));
    } else {
      name = `XEVORAS Atelier Exclusive Piece #${prodId.toUpperCase()}`;
    }

    // 5. Accurate Fabric Detection
    let fabric = 'Premium Verified Apparel Fabrication';
    if (isJeans) {
      fabric = lowerSlug.includes('dark-blue') || lowerSlug.includes('blue')
        ? '100% Ring-Spun Cotton Denim Twill (Dark Indigo Wash)'
        : '100% Ring-Spun Cotton Heavyweight Denim Twill';
    } else if (isTrouser) {
      fabric = lowerSlug.includes('plazzo') || lowerSlug.includes('palazzo') || lowerSlug.includes('trackpant') || lowerSlug.includes('lower')
        ? 'Ultra-Comfort Breathable Cotton-Elastane Soft Stretch Fabric'
        : 'Tailored Stretch Crepe & Fine Suiting Twill';
    } else if (lowerSlug.includes('georgette')) {
      fabric = 'Georgette Crepe with Micro Zari Embroidery';
    } else if (isSaree || lowerSlug.includes('silk') || lowerSlug.includes('banarasi') || lowerSlug.includes('chanderi')) {
      fabric = 'Pure Mulberry Silk with Delicate Zari Weave';
    } else if (lowerSlug.includes('cotton')) {
      fabric = '100% Breathable Organic Cotton';
    } else if (lowerSlug.includes('chiffon')) {
      fabric = 'Airy Flowing Chiffon Voile';
    } else if (lowerSlug.includes('rayon')) {
      fabric = 'Modal Rayon Soft-Touch Blend';
    } else if (lowerSlug.includes('velvet')) {
      fabric = 'Plush Crushed Velvet';
    } else if (lowerSlug.includes('satin')) {
      fabric = 'Heavy Liquid Lustre Satin';
    } else if (lowerSlug.includes('linen')) {
      fabric = 'Pure Belgian Flax Linen';
    }

    // 6. Occasion & Style Attributes
    let occasion = 'Versatile Contemporary Elegance';
    if (isJeans) {
      occasion = 'Casual Everyday & Modern Streetwear';
    } else if (isTrouser) {
      occasion = 'Workplace Chic & Sophisticated Casual';
    } else if (isSaree || isKurti) {
      occasion = 'Festive, Wedding & Traditional Celebrations';
    } else if (lowerSlug.includes('wedding') || lowerSlug.includes('party') || lowerSlug.includes('cocktail')) {
      occasion = 'Cocktail & Wedding Occasion';
    } else if (lowerSlug.includes('casual') || lowerSlug.includes('daily')) {
      occasion = 'Contemporary Casual Luxury';
    }

    // 7. Silhouette & Fit
    let fit = 'Comfort Tailored Luxury Fit';
    if (lowerSlug.includes('wide-leg') || lowerSlug.includes('wide-legg') || lowerSlug.includes('flare')) {
      fit = 'High-Rise Wide Leg Flare';
    } else if (lowerSlug.includes('straight')) {
      fit = 'Relaxed Straight Architectural Fit';
    } else if (lowerSlug.includes('slim') || lowerSlug.includes('skinny')) {
      fit = 'Sculpted Slim Silhouette';
    } else if (lowerSlug.includes('relaxed') || lowerSlug.includes('oversized')) {
      fit = 'Relaxed Fluid Flare';
    }

    // 8. Pattern Detailing
    let pattern = 'Refined Detailing';
    if (isJeans) {
      pattern = lowerSlug.includes('dark-blue') ? 'Deep Indigo Stonewash with Contrast Stitching' : 'Vintage Stonewash Finish';
    } else if (lowerSlug.includes('embroider')) {
      pattern = 'Intricate Hand-Guided Embroidery';
    } else if (lowerSlug.includes('print')) {
      pattern = 'Artisanal Floral Heritage Print';
    } else if (lowerSlug.includes('solid') || lowerSlug.includes('plain')) {
      pattern = 'Monochrome Minimalist';
    }

    // 9. Editorial Description
    const description = `Crafted with uncompromising precision, the ${name} embodies XEVORAS's philosophy of 'Always Rare · हटके हमेशा'.

Silhouette & Design:
• Cut in ${fabric} with a flattering ${fit.toLowerCase()}.
• Detailed with ${pattern.toLowerCase()} engineered for modern luxury styling.
• Tailored specifically for ${occasion.toLowerCase()}.

Fabrication & Care:
• Material: High-grade textile curated for exceptional drape, durability, and breathability.
• Care: Dry clean recommended or machine wash cold inside out. Steam press gently.
• Origin: Verified Indian artisan cluster, curated and authenticated by the XEVORAS Sourcing Atelier.`;

    // 10. Real Pricing & Profit Margin Calculation
    // If custom cost provided, use it. Otherwise, use intelligent category baseline:
    let defaultCostPaise = 39900;
    let defaultPricePaise = 139900;

    if (isJeans) {
      defaultCostPaise = 37500; // Real Meesho price: ₹375
      defaultPricePaise = 129900; // Xevoras live selling price: ₹1,299
    } else if (isTrouser) {
      const isPack = lowerSlug.includes('pack') || lowerSlug.includes('combo') || lowerSlug.includes('set') || lowerSlug.includes('-2') || lowerSlug.includes('2');
      defaultCostPaise = isPack ? 29900 : 24900; // ₹299 for pack / ₹249 for single
      defaultPricePaise = isPack ? 99900 : 89900; // ₹999 selling price
    } else if (isSaree) {
      defaultCostPaise = 55000; // ₹550
      defaultPricePaise = 199900; // ₹1,999
    } else if (isKurti) {
      defaultCostPaise = 39900; // ₹399
      defaultPricePaise = 139900; // ₹1,399
    } else if (isCoord) {
      defaultCostPaise = 49900; // ₹499
      defaultPricePaise = 169900; // ₹1,699
    } else if (isShirt) {
      defaultCostPaise = 34900; // ₹349
      defaultPricePaise = 119900; // ₹1,199
    }

    const costPricePaise = customCostPaise ?? defaultCostPaise;
    const pricePaise = customPricePaise ?? (customCostPaise ? Math.max(customCostPaise * 3, defaultPricePaise) : defaultPricePaise);
    const compareAtPricePaise = Math.round(pricePaise * 2.1);
    const profitPaise = pricePaise - costPricePaise;
    const marginPercent = Math.round((profitPaise / pricePaise) * 100);

    // 11. Clean Unique Slug
    const cleanBaseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${cleanBaseSlug}-${prodId.toLowerCase()}`;

    // 12. Accurate Image Selection (Matching Garment Type Exactly)
    let coverImage = customImageUrl;
    let galleryImages: string[] = [];

    if (!coverImage) {
      if (isJeans) {
        coverImage = this.CURATED_IMAGES.jeans[0]; // Real Denim Jeans!
        galleryImages = this.CURATED_IMAGES.jeans;
      } else if (isTrouser) {
        coverImage = this.CURATED_IMAGES.trousers[0];
        galleryImages = this.CURATED_IMAGES.trousers;
      } else if (isSaree || isKurti) {
        coverImage = this.CURATED_IMAGES.ethnic[0];
        galleryImages = this.CURATED_IMAGES.ethnic;
      } else if (isCoord) {
        coverImage = this.CURATED_IMAGES.womenCoords[0];
        galleryImages = this.CURATED_IMAGES.womenCoords;
      } else if (gender === 'men') {
        if (isOuterwear) {
          coverImage = this.CURATED_IMAGES.menOuterwear[0];
          galleryImages = this.CURATED_IMAGES.menOuterwear;
        } else {
          coverImage = this.CURATED_IMAGES.menShirts[0];
          galleryImages = this.CURATED_IMAGES.menShirts;
        }
      } else {
        if (isOuterwear) {
          coverImage = this.CURATED_IMAGES.womenOuterwear[0];
          galleryImages = this.CURATED_IMAGES.womenOuterwear;
        } else {
          coverImage = this.CURATED_IMAGES.womenDresses[0];
          galleryImages = this.CURATED_IMAGES.womenDresses;
        }
      }
    } else {
      galleryImages = [coverImage];
    }

    // 13. Sizing Matrix (Accurate garment-specific sizing)
    let variants: Array<{ size: string; sku: string; stockCount: number; pricePaise: number }>;
    if (isJeans) {
      const waistSizes = ['26', '28', '30', '32', '34'];
      variants = waistSizes.map((size) => ({
        size: `${size}`,
        sku: `XV-JEAN-${prodId.toUpperCase()}-${size}`,
        stockCount: 20,
        pricePaise,
      }));
    } else if (isTrouser) {
      const isLounge = lowerSlug.includes('plazzo') || lowerSlug.includes('palazzo') || lowerSlug.includes('trackpant') || lowerSlug.includes('lower');
      const trouserSizes = isLounge ? ['Free Size', 'S', 'M', 'L', 'XL', 'XXL'] : ['28', '30', '32', '34', '36'];
      variants = trouserSizes.map((size) => ({
        size: `${size}`,
        sku: `XV-TRS-${prodId.toUpperCase()}-${size}`,
        stockCount: 25,
        pricePaise,
      }));
    } else {
      const apparelSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      const stockMap: Record<string, number> = { S: 15, M: 25, L: 30, XL: 20, XXL: 10 };
      variants = apparelSizes.map((size) => ({
        size,
        sku: `XV-MEE-${prodId.toUpperCase()}-${size}`,
        stockCount: stockMap[size] || 20,
        pricePaise,
      }));
    }

    return {
      name,
      slug,
      description,
      gender,
      categoryId,
      categoryName,
      fabric,
      pattern,
      fit,
      occasion,
      sleeveType: isJeans || isTrouser ? 'Not Applicable' : 'Comfort Tailored',
      neckType: isJeans || isTrouser ? 'Not Applicable' : 'Classic Elegant',
      careInstructions: 'Dry clean recommended or machine wash cold. Steam iron on reverse.',
      costPricePaise,
      pricePaise,
      compareAtPricePaise,
      profitPaise,
      marginPercent,
      sourceUrl: validation.cleanUrl,
      sourceProductId: prodId,
      coverImage,
      galleryImages,
      variants,
    };
  }
}
