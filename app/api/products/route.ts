import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAdminSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get('gender');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const featured = searchParams.get('featured');

    const where: any = {
      status: 'PUBLISHED',
    };

    if (gender && gender !== 'all') {
      where.OR = [{ gender: gender.toLowerCase() }, { gender: 'unisex' }];
    }

    if (category && category !== 'all') {
      where.categoryId = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } },
        { keywords: { contains: search.trim() } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { pricePaise: 'asc' };
    if (sort === 'price_desc') orderBy = { pricePaise: 'desc' };
    if (sort === 'newest') orderBy = { isNewArrival: 'desc' };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
        media: { orderBy: { sortOrder: 'asc' } },
        resellingDetail: true,
      },
      orderBy,
    });

    // Format products for standard client consumption
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription || undefined,
      gender: p.gender as any,
      pricePaise: p.pricePaise,
      compareAtPricePaise: p.compareAtPricePaise,
      material: p.material || undefined,
      fit: p.fit || undefined,
      pattern: p.pattern || undefined,
      care: p.careInstructions || undefined,
      keywords: p.keywords || undefined,
      featured: p.featured,
      isNewArrival: p.isNewArrival,
      category: p.categoryId,
      categoryName: p.category.name,
      sourcing: p.sourcingType.toLowerCase() as any,
      images: p.media.map((m) => ({ url: m.url, alt: m.altText || p.name, isCover: m.isCover })),
      variants: p.variants.map((v) => ({
        sku: v.sku,
        size: v.size,
        colorName: v.colorName,
        colorHex: v.colorHex || undefined,
        stock: v.stockCount,
      })),
    }));

    return NextResponse.json({ products: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { name, categoryId, gender, pricePaise, compareAtPricePaise, description, material, fit, variants, images } = body;

    if (!name || !pricePaise) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const created = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || 'Tailored contemporary piece cut from weighted natural fibers.',
        gender: gender || 'women',
        pricePaise: Number(pricePaise),
        compareAtPricePaise: compareAtPricePaise ? Number(compareAtPricePaise) : null,
        categoryId: categoryId || 'women-dresses',
        material: material || undefined,
        fit: fit || undefined,
        sourcingType: 'OWN',
        featured: true,
        isNewArrival: true,
        variants: {
          create: (variants && variants.length > 0
            ? variants
            : [
                { sku: `XV-${slug.toUpperCase()}-S`, size: 'S', colorName: 'Standard', stockCount: 10 },
                { sku: `XV-${slug.toUpperCase()}-M`, size: 'M', colorName: 'Standard', stockCount: 15 },
                { sku: `XV-${slug.toUpperCase()}-L`, size: 'L', colorName: 'Standard', stockCount: 12 },
              ]
          ).map((v: any) => ({
            sku: v.sku,
            size: v.size,
            colorName: v.colorName || 'Standard',
            colorHex: v.colorHex,
            stockCount: Number(v.stock || v.stockCount || 10),
          })),
        },
        media: {
          create: (images && images.length > 0
            ? images
            : [{ url: '/media/products/women-1.jpg', isCover: true }]
          ).map((img: any, idx: number) => ({
            url: typeof img === 'string' ? img : img.url,
            altText: name,
            sortOrder: idx,
            isCover: idx === 0,
          })),
        },
      },
      include: { variants: true, media: true },
    });

    return NextResponse.json({ success: true, product: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
