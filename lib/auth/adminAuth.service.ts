import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { prisma } from '../db/prisma';

export class AdminAuthService {
  /**
   * Generates a cryptographically secure salt and hashes the password using PBKDF2 (SHA-512)
   */
  public static hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
    const salt = existingSalt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { hash: `${salt}:${hash}`, salt };
  }

  /**
   * Verifies a plain text password against a stored salt:hash string
   */
  public static verifyPassword(password: string, storedHash: string): boolean {
    if (!storedHash || !storedHash.includes(':')) {
      // Legacy or plain text comparison fallback
      return password === storedHash;
    }
    const [salt, originalHash] = storedHash.split(':');
    const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(originalHash));
    } catch {
      return false;
    }
  }

  /**
   * Retrieves the active admin user from DB, or initializes one from environment variables
   */
  public static async getOrCreateSuperAdmin(): Promise<{ id: string; email: string; passwordHash: string }> {
    // 1. Look in Database for SUPER_ADMIN or ADMIN
    let admin = await prisma.user.findFirst({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN'] },
      },
    });

    if (admin && admin.passwordHash) {
      return { id: admin.id, email: admin.email, passwordHash: admin.passwordHash };
    }

    // 2. If not in DB, initialize with env defaults or fallback
    const defaultEmail = process.env.ADMIN_EMAIL || process.env.DEFAULT_ADMIN_EMAIL || 'admin@xevoras.com';
    const defaultPass = process.env.ADMIN_PASSWORD || process.env.DEFAULT_ADMIN_PASSWORD || 'xevoras@admin2026';
    const { hash } = this.hashPassword(defaultPass);

    if (admin) {
      // Update existing admin with hashed password
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: { passwordHash: hash, role: 'SUPER_ADMIN' },
      });
    } else {
      // Create new super admin record
      admin = await prisma.user.create({
        data: {
          email: defaultEmail.toLowerCase().trim(),
          name: 'XEVORAS Super Admin',
          role: 'SUPER_ADMIN',
          passwordHash: hash,
        },
      });
    }

    return { id: admin.id, email: admin.email, passwordHash: admin.passwordHash! };
  }

  /**
   * Verifies incoming admin credentials against DB and secure env variables
   */
  public static async verifyCredentials(email: string, password: string): Promise<{ valid: boolean; user?: { id: string; email: string; role: string } }> {
    if (!email || !password) return { valid: false };

    const cleanEmail = email.trim().toLowerCase();

    // Check DB
    const admin = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        role: { in: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
      },
    });

    if (admin && admin.passwordHash) {
      const match = this.verifyPassword(password, admin.passwordHash);
      if (match) {
        return {
          valid: true,
          user: { id: admin.id, email: admin.email, role: admin.role },
        };
      }
    }

    // Fallback: Check environment variables if DB had no match
    const envEmail = (process.env.ADMIN_EMAIL || process.env.DEFAULT_ADMIN_EMAIL || '').toLowerCase().trim();
    const envPass = process.env.ADMIN_PASSWORD || process.env.DEFAULT_ADMIN_PASSWORD || '';

    if (envEmail && cleanEmail === envEmail && envPass && password === envPass) {
      // Sync into DB for future persistence
      const { hash } = this.hashPassword(envPass);
      const synced = await prisma.user.upsert({
        where: { email: cleanEmail },
        update: { passwordHash: hash, role: 'SUPER_ADMIN' },
        create: {
          email: cleanEmail,
          name: 'XEVORAS Super Admin',
          passwordHash: hash,
          role: 'SUPER_ADMIN',
        },
      });
      return {
        valid: true,
        user: { id: synced.id, email: synced.email, role: synced.role },
      };
    }

    return { valid: false };
  }

  /**
   * Updates admin email and password securely in database and .env file
   */
  public static async updateCredentials(
    currentUserId: string,
    newEmail: string,
    newPassword: string
  ): Promise<{ success: boolean; email: string }> {
    const cleanEmail = newEmail.trim().toLowerCase();
    const { hash } = this.hashPassword(newPassword);

    // 1. Update in Database
    const updated = await prisma.user.update({
      where: { id: currentUserId },
      data: {
        email: cleanEmail,
        passwordHash: hash,
        role: 'SUPER_ADMIN',
      },
    });

    // 2. Persist in .env and .env.local for permanence
    try {
      const envPath = path.join(process.cwd(), '.env');
      const envLocalPath = path.join(process.cwd(), '.env.local');

      for (const p of [envPath, envLocalPath]) {
        if (fs.existsSync(p)) {
          let content = fs.readFileSync(p, 'utf8');
          content = content.replace(/DEFAULT_ADMIN_EMAIL=.*$/m, `DEFAULT_ADMIN_EMAIL="${cleanEmail}"`);
          content = content.replace(/DEFAULT_ADMIN_PASSWORD=.*$/m, `DEFAULT_ADMIN_PASSWORD="${newPassword}"`);
          content = content.replace(/ADMIN_EMAIL=.*$/m, `ADMIN_EMAIL="${cleanEmail}"`);
          content = content.replace(/ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD="${newPassword}"`);
          
          if (!content.includes('ADMIN_EMAIL=')) {
            content += `\nADMIN_EMAIL="${cleanEmail}"\nADMIN_PASSWORD="${newPassword}"\n`;
          }
          fs.writeFileSync(p, content, 'utf8');
        }
      }
    } catch (e) {
      console.warn('Could not update .env file, DB update succeeded:', e);
    }

    return { success: true, email: updated.email };
  }
}
