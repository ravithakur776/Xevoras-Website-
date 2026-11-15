import React, { Suspense } from 'react';
import { ShopCatalog } from '@/components/storefront/ShopCatalog';
import { CatalogService } from '@/lib/services/catalog.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Women’s Collection — XEVORAS',
  description: 'Fluid column gowns, pleated flared trousers, and minimalist coordinated sets designed for considered living.',
};

export default async function WomenPage() {
  const liveProducts = await CatalogService.getLiveProducts();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone">Loading women’s collection...</div>}>
      <ShopCatalog initialGender="women" initialTitle="Women’s Collection" initialProducts={liveProducts} />
    </Suspense>
  );
}
