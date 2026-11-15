import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 1. Ensure DATABASE_URL is defined so prisma generate never fails on Vercel
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

console.log('🚀 [XEVORAS VERCEL BUILD] Initializing build environment...');
console.log('⚙️ Target DATABASE_URL:', process.env.DATABASE_URL.startsWith('file:') ? 'SQLite local / ephemeral' : 'External Database');

// 2. Generate Prisma Client for target architecture
console.log('📦 [XEVORAS VERCEL BUILD] Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
} catch (err) {
  console.error('Prisma generate encountered an issue:', err);
  throw err;
}

// 3. If using local SQLite and dev.db does not exist, initialize schema and seed
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
if (process.env.DATABASE_URL.startsWith('file:') && !fs.existsSync(dbPath)) {
  console.log('🗄️ [XEVORAS VERCEL BUILD] Initializing SQLite schema for serverless execution...');
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env });
    const seedPath = path.join(process.cwd(), 'prisma', 'seed.mjs');
    if (fs.existsSync(seedPath)) {
      console.log('🌱 [XEVORAS VERCEL BUILD] Seeding initial luxury collection...');
      execSync('node prisma/seed.mjs', { stdio: 'inherit', env: process.env });
    }
  } catch (err) {
    console.warn('Database initialization warning (safe to proceed):', err);
  }
}

// 4. Run Next.js production build
console.log('⚡ [XEVORAS VERCEL BUILD] Compiling Next.js production bundle...');
execSync('next build', { stdio: 'inherit', env: process.env });
console.log('✅ [XEVORAS VERCEL BUILD] Deployment build finished successfully!');
