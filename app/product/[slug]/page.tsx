import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CatalogService } from '@/lib/services/catalog.service';
import { ProductDetailView } from '@/components/storefront/ProductDetailView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await CatalogService.getLiveProductBySlug(slug);

  if (!product) {
    return {
      title: 'Piece Not Found — XEVORAS',
    };
  }

  return {
    title: `${product.name} — XEVORAS`,
    description: product.shortDescription || product.description,
    openGraph: {
      title: `${product.name} — XEVORAS`,
      description: product.shortDescription || product.description,
      images: [
        {
          url: product.images[0]?.url || '/media/products/women-1.jpg',
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await CatalogService.getLiveProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await CatalogService.getLiveProducts();
  const related = allProducts.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((i) => `https://xevoras.com${i.url}`),
    description: product.shortDescription || product.description,
    sku: product.variants[0]?.sku || `XV-${product.slug.toUpperCase()}`,
    brand: {
      '@type': 'Brand',
      name: 'XEVORAS',
    },
    category: product.categoryName,
    material: product.material,
    offers: {
      '@type': 'Offer',
      url: `https://xevoras.com/product/${product.slug}`,
      priceCurrency: 'INR',
      price: (product.pricePaise / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://xevoras.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: 'https://xevoras.com/shop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.categoryName,
        item: `https://xevoras.com/shop?category=${product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `https://xevoras.com/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailView
        product={product}
        relatedProducts={related.length > 0 ? related : CatalogService.getAllProducts().slice(0, 4)}
      />
    </>
  );
}
