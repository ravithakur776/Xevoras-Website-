/**
 * XEVORAS — IMAGE ASSET & CDN NORMALIZATION UTILITY
 * 
 * Ensures every product image URL (especially supplier CDNs like Meesho) is
 * properly formatted, accessible, clean, and never fails with 400 Bad Request.
 */

export function normalizeImageUrl(url: string | null | undefined, fallback = '/media/products/women-1.jpg'): string {
  if (!url || typeof url !== 'string') return fallback;
  let clean = url.trim();
  if (!clean) return fallback;

  // Handle Meesho CDN product images
  if (clean.includes('images.meesho.com/images/products/')) {
    // Strip trailing query parameters like ?width=512
    clean = clean.split('?')[0];

    // Handle truncated endings like _51 or _512
    if (clean.endsWith('_51')) {
      clean = clean.replace(/_51$/, '_512.jpg');
    } else if (clean.endsWith('_512')) {
      clean = clean + '.jpg';
    } else if (clean.endsWith('.avif') || clean.endsWith('.webp')) {
      // Standardize to high-compatibility .jpg for rock-solid cross-browser & Next.js rendering
      clean = clean.replace(/\.(avif|webp)$/i, '.jpg');
    } else if (!/\.(jpg|jpeg|png)$/i.test(clean)) {
      clean = clean + '_512.jpg';
    }
  }

  return clean;
}

export function sanitizeMeeshoImageInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return normalizeImageUrl(input, '');
}
