import { NextRequest, NextResponse } from 'next/server';
import { signSessionToken, getAdminSessionFromRequest } from '@/lib/auth/session';
import { AdminAuthService } from '@/lib/auth/adminAuth.service';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Please enter both email and password.' }, { status: 400 });
    }

    // Verify against DB / hashed credentials
    const verification = await AdminAuthService.verifyCredentials(email, password);

    if (!verification.valid || !verification.user) {
      return NextResponse.json({ error: 'Invalid staff credentials. Access denied.' }, { status: 401 });
    }

    const sessionPayload = {
      userId: verification.user.id,
      email: verification.user.email,
      role: (verification.user.role as any) || 'ADMIN',
      createdAt: Date.now(),
    };

    const token = signSessionToken(sessionPayload);

    const res = NextResponse.json({
      success: true,
      user: { email: verification.user.email, role: verification.user.role },
    });

    // Set HTTP-only cookie; only set secure flag if served over HTTPS
    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https://');
    res.cookies.set('xevoras_admin_token', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Signed out' });
  res.cookies.set('xevoras_admin_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return res;
}
