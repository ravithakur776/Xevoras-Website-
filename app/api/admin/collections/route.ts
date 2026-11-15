import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAdminSessionFromRequest } from '@/lib/auth/session';

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ collections });
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
    const { name, description, imageUrl } = body;

    if (!name) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const collection = await prisma.collection.upsert({
      where: { slug },
      update: { name, description, imageUrl },
      create: { name, slug, description, imageUrl },
    });

    return NextResponse.json({ success: true, collection });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
