import React, { Suspense } from 'react';
import { ShopCatalog } from '@/components/storefront/ShopCatalog';
import { CatalogService } from '@/lib/services/catalog.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'All Pieces — XEVORAS Contemporary Collection',
  description: 'Shop contemporary essentials, weighted shirting, rigid straight denim, and floor-length column gowns.',
};

export default async function ShopPage() {
  const liveProducts = await CatalogService.getLiveProducts();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone">Loading collection...</div>}>
      <ShopCatalog initialGender="all" initialTitle="Complete Wardrobe" initialProducts={liveProducts} />
    </Suspense>
  );
}
