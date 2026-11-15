import React, { Suspense } from 'react';
import { ShopCatalog } from '@/components/storefront/ShopCatalog';
import { CatalogService } from '@/lib/services/catalog.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Men’s Collection — XEVORAS',
  description: 'Weighted shirting, rigid straight denim, and durable layering essentials tailored for modern presence.',
};

export default async function MenPage() {
  const liveProducts = await CatalogService.getLiveProducts();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone">Loading men’s collection...</div>}>
      <ShopCatalog initialGender="men" initialTitle="Men’s Collection" initialProducts={liveProducts} />
    </Suspense>
  );
}
