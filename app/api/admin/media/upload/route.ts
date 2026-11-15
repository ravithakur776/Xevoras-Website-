import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth/session';
import { ImageStorageService } from '@/lib/services/imageStorage.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';

    // Case 1: multipart/form-data
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const altText = (formData.get('altText') as string) || '';

      if (!file) {
        return NextResponse.json({ error: 'No image file provided in form data' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const saved = await ImageStorageService.saveImageBuffer(
        buffer,
        file.name,
        file.type,
        altText || file.name
      );

      return NextResponse.json({ success: true, media: saved });
    }

    // Case 2: application/json (Base64 data URI)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { dataUri, filename, altText } = body;

      if (!dataUri) {
        return NextResponse.json({ error: 'No dataUri provided in request body' }, { status: 400 });
      }

      const saved = await ImageStorageService.saveBase64Image(
        dataUri,
        filename || 'uploaded-product.jpg',
        altText
      );

      return NextResponse.json({ success: true, media: saved });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type. Use multipart/form-data or application/json.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Image upload failed' }, { status: 500 });
  }
}
