import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Helper to determine the best database URL
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    return process.env.DATABASE_URL;
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

  if (isServerless) {
    const tmpDbPath = '/tmp/dev.db';
    // If bundled db exists and /tmp/dev.db doesn't, copy it to writable /tmp
    try {
      if (fs.existsSync(bundledDbPath) && !fs.existsSync(tmpDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      }
    } catch (e) {
      console.warn('Could not copy bundled DB to /tmp:', e);
    }
    const targetPath = fs.existsSync(tmpDbPath) ? tmpDbPath : bundledDbPath;
    const url = `file:${targetPath}`;
    process.env.DATABASE_URL = url;
    return url;
  }

  const localUrl = `file:${bundledDbPath}`;
  process.env.DATABASE_URL = localUrl;
  return localUrl;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
