import { NextRequest, NextResponse } from 'next/server';
import { VirtualTryOnService, TryOnRequest } from '@/lib/services/try-on.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userImageBase64, clothingImageUrl, productId, productName, category, mode, consent } = body;

    // 1. Consent verification
    if (!consent) {
      return NextResponse.json(
        { error: 'Customer consent is required for biometric image processing.' },
        { status: 400 }
      );
    }

    // 2. Image validation
    if (!userImageBase64 || typeof userImageBase64 !== 'string') {
      return NextResponse.json({ error: 'Missing customer portrait image' }, { status: 400 });
    }

    if (
      !userImageBase64.startsWith('data:image/jpeg') &&
      !userImageBase64.startsWith('data:image/png') &&
      !userImageBase64.startsWith('data:image/webp') &&
      !userImageBase64.startsWith('/media/')
    ) {
      return NextResponse.json(
        { error: 'Unsupported format. Please upload JPEG, PNG, or WebP.' },
        { status: 415 }
      );
    }

    if (!clothingImageUrl || !productId) {
      return NextResponse.json({ error: 'Missing garment selection' }, { status: 400 });
    }

    // Size check (max ~10MB payload)
    if (userImageBase64.length > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image exceeds 10MB limit' }, { status: 413 });
    }

    const tryOnPayload: TryOnRequest = {
      userImageBase64,
      clothingImageUrl,
      productId,
      productName: productName || 'XEVORAS Garment',
      category: category || 'tops',
      mode: mode || 'quality',
    };

    const job = await VirtualTryOnService.executeTryOn(tryOnPayload);
    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    console.error('[API /api/try-on] Execution error:', err);
    return NextResponse.json({ error: err.message || 'Internal Try-On error' }, { status: 500 });
  }
}
