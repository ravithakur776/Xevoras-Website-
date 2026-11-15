import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 1. Ensure DATABASE_URL is defined so prisma generate never fails on Vercel
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

console.log('🚀 [XEVORAS VERCEL BUILD] Initializing build environment...');
const isPostgres = process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://');
console.log('⚙️ Target Database:', isPostgres ? 'PostgreSQL Cloud Database' : 'SQLite Local/Ephemeral');

// 2. Synchronize schema.prisma datasource provider with target database type
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  if (isPostgres && schema.includes('provider = "sqlite"')) {
    console.log('🔄 [XEVORAS VERCEL BUILD] Switching Prisma provider to PostgreSQL...');
    schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema, 'utf8');
  } else if (!isPostgres && schema.includes('provider = "postgresql"')) {
    console.log('🔄 [XEVORAS VERCEL BUILD] Switching Prisma provider to SQLite...');
    schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
    fs.writeFileSync(schemaPath, schema, 'utf8');
  }
}

// 3. Generate Prisma Client for target architecture
console.log('📦 [XEVORAS VERCEL BUILD] Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
} catch (err) {
  console.error('Prisma generate encountered an issue:', err);
  throw err;
}

// 4. Initialize schema and seed if needed
if (isPostgres) {
  console.log('🗄️ [XEVORAS VERCEL BUILD] Ensuring PostgreSQL tables are synced...');
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env });
    const seedPath = path.join(process.cwd(), 'prisma', 'seed.mjs');
    if (fs.existsSync(seedPath)) {
      console.log('🌱 [XEVORAS VERCEL BUILD] Syncing initial catalog into PostgreSQL...');
      execSync('node prisma/seed.mjs', { stdio: 'inherit', env: process.env });
    }
  } catch (err) {
    console.warn('PostgreSQL sync note (safe to proceed):', err);
  }
} else {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  if (process.env.DATABASE_URL.startsWith('file:') && !fs.existsSync(dbPath)) {
    console.log('🗄️ [XEVORAS VERCEL BUILD] Initializing SQLite schema...');
    try {
      execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env });
      const seedPath = path.join(process.cwd(), 'prisma', 'seed.mjs');
      if (fs.existsSync(seedPath)) {
        console.log('🌱 [XEVORAS VERCEL BUILD] Seeding initial luxury collection...');
        execSync('node prisma/seed.mjs', { stdio: 'inherit', env: process.env });
      }
    } catch (err) {
      console.warn('SQLite init warning (safe to proceed):', err);
    }
  }
}

// 5. Run Next.js production build
console.log('⚡ [XEVORAS VERCEL BUILD] Compiling Next.js production bundle...');
execSync('next build', { stdio: 'inherit', env: process.env });
console.log('✅ [XEVORAS VERCEL BUILD] Deployment build finished successfully!');
