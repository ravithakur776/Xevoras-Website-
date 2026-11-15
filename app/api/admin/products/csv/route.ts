import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAdminSessionFromRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'ID',
      'Name',
      'Slug',
      'Category',
      'Gender',
      'SellingPriceINR',
      'CostPriceINR',
      'Status',
      'Sourcing',
      'SupplierStatus',
      'SupplierURL',
      'TotalStock',
      'PrimarySKU',
    ];

    const rows = products.map((p) => {
      const totalStock = p.variants.reduce((sum, v) => sum + v.stockCount, 0);
      const primarySku = p.variants[0]?.sku || `XV-${p.slug.toUpperCase()}`;
      return [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.slug,
        p.category?.slug || p.categoryId,
        p.gender,
        (p.pricePaise / 100).toFixed(2),
        ((p.costPricePaise || 0) / 100).toFixed(2),
        p.status,
        p.sourcingType,
        p.supplierStatus,
        `"${(p.supplierSourceUrl || '').replace(/"/g, '""')}"`,
        totalStock,
        primarySku,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="xevoras-products-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
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
    const { csvText } = body;

    if (!csvText || typeof csvText !== 'string') {
      return NextResponse.json({ error: 'Valid CSV text content is required' }, { status: 400 });
    }

    const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or missing data rows' }, { status: 400 });
    }

    let importedCount = 0;
    const errors: string[] = [];

    // Simple robust CSV parser for name, slug, price, cost, etc.
    for (let i = 1; i < lines.length; i++) {
      try {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length < 6) continue;

        const name = parts[1];
        let slug = parts[2] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const categoryId = parts[3] || 'women-dresses';
        const gender = parts[4] || 'women';
        const pricePaise = Math.round(parseFloat(parts[5]) * 100);
        const costPricePaise = parts[6] ? Math.round(parseFloat(parts[6]) * 100) : 0;
        const status = (parts[7] || 'DRAFT').toUpperCase();
        const sourcingType = (parts[8] || 'OWN').toUpperCase();
        const supplierSourceUrl = parts[10] || null;

        if (!name || isNaN(pricePaise)) continue;

        // Ensure unique slug
        let finalSlug = slug;
        let counter = 1;
        while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
          finalSlug = `${slug}-${counter++}`;
        }

        await prisma.product.create({
          data: {
            name,
            slug: finalSlug,
            description: `Imported piece: ${name}`,
            gender: gender.toLowerCase(),
            pricePaise,
            costPricePaise,
            categoryId,
            status,
            sourcingType,
            supplierSourceUrl,
            variants: {
              create: [
                { sku: `XV-${finalSlug.toUpperCase()}-S`, size: 'S', colorName: 'Standard', stockCount: 10 },
                { sku: `XV-${finalSlug.toUpperCase()}-M`, size: 'M', colorName: 'Standard', stockCount: 15 },
                { sku: `XV-${finalSlug.toUpperCase()}-L`, size: 'L', colorName: 'Standard', stockCount: 10 },
              ],
            },
            media: {
              create: [{ url: '/media/products/women-1.jpg', isCover: true, altText: name }],
            },
          },
        });

        importedCount++;
      } catch (lineErr: any) {
        errors.push(`Row ${i + 1}: ${lineErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
