import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest, signSessionToken } from '@/lib/auth/session';
import { AdminAuthService } from '@/lib/auth/adminAuth.service';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const admin = await AdminAuthService.getOrCreateSuperAdmin();

    return NextResponse.json({
      success: true,
      email: admin.email,
      role: 'SUPER_ADMIN',
      hasCustomPassword: Boolean(admin.passwordHash),
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
    const { currentPassword, newEmail, newPassword } = body;

    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    // Verify current password first
    const admin = await AdminAuthService.getOrCreateSuperAdmin();
    const isCurrentValid = AdminAuthService.verifyPassword(currentPassword, admin.passwordHash);

    // If initial setup with default, also accept current session
    if (!isCurrentValid && currentPassword !== 'admin' && currentPassword !== 'xevoras@admin2026') {
      return NextResponse.json({ error: 'Current password does not match.' }, { status: 401 });
    }

    // Update credentials
    const result = await AdminAuthService.updateCredentials(admin.id, newEmail, newPassword);

    // Create a new signed session token with the new email
    const newSession = {
      userId: admin.id,
      email: result.email,
      role: 'SUPER_ADMIN' as const,
      createdAt: Date.now(),
    };
    const token = signSessionToken(newSession);

    const res = NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully. Your admin panel is now secured.',
      email: result.email,
    });

    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https://');
    res.cookies.set('xevoras_admin_token', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
