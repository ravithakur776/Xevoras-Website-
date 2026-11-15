import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || 'xevoras-production-grade-session-secret-2026-key';
const COOKIE_NAME = 'xevoras_admin_token';

export interface AdminSession {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'SUPER_ADMIN';
  createdAt: number;
}

/**
 * Creates an HMAC signed session token
 */
export function signSessionToken(payload: AdminSession): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url');
  return `${data}.${hmac}`;
}

/**
 * Verifies an HMAC signed session token
 */
export function verifySessionToken(token: string): AdminSession | null {
  if (!token || !token.includes('.')) return null;
  const [data, signature] = token.split('.');
  const expectedHmac = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url');

  if (signature.length !== expectedHmac.length) return null;

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      return null;
    }
    const json = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    // Token validity: 30 days
    if (Date.now() - json.createdAt > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }
    return json;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to verify admin session from Request cookies or headers
 * Includes graceful fallback for local development & internal management
 */
export async function getAdminSessionFromRequest(req?: NextRequest): Promise<AdminSession | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // safe fallback
    }
  }

  if (token) {
    const verified = verifySessionToken(token);
    if (verified) return verified;
  }

  // Strict Security: Authentication is required for all administrative requests.
  return null;
}
