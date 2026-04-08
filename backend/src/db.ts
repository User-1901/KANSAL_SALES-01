import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Database Connection Pool ──────────────────────────────────────────────────
// Uses DATABASE_URL env var (standard PostgreSQL connection string)
// Falls back to localhost for local development
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/zenith_atelier',
  // For Render: SSL required for external connections
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pgPool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err);
  process.exit(1);
});

// ── Init ──────────────────────────────────────────────────────────────────────

async function doInit() {
  const client = await pgPool.connect();
  try {
    // Migration tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        filename   VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const migrationsDir = path.resolve(__dirname, '../migrations');
    const allFiles = fs.existsSync(migrationsDir)
      ? fs.readdirSync(migrationsDir).sort().filter(f => f.endsWith('.sql'))
      : [];

    // Check if users table already exists (pre-migration-tracker DB)
    const usersExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      )
    `);
    const migrationsCount = await client.query(
      `SELECT COUNT(*)::text AS count FROM _migrations`
    );

    if (usersExists.rows[0].exists && migrationsCount.rows[0].count === '0') {
      // Existing DB with no tracker — mark all files as already applied
      for (const file of allFiles) {
        await client.query(
          `INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
          [file]
        );
      }
      console.log('[DB] Existing database detected — skipped migrations.');
    } else {
      // Fresh DB or incremental — run only unapplied migrations
      for (const file of allFiles) {
        const already = await client.query(
          `SELECT filename FROM _migrations WHERE filename = $1`, [file]
        );
        if (already.rows.length > 0) continue;

        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        console.log(`[DB] Running migration: ${file}`);
        await client.query(sql);
        await client.query(`INSERT INTO _migrations (filename) VALUES ($1)`, [file]);
      }
    }

    // ── Seed Default Admin Account ────────────────────────────────────────────────
    // SECURITY: Change these credentials immediately in production!
    // Replace with environment variables for real deployments
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@zenith-atelier.com';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe@123';
    const hash = await bcrypt.hash(adminPassword, 10);
    
    await client.query(
      `INSERT INTO users (email, display_name, password_hash, role, email_verified)
       VALUES ($1, $2, $3, 'admin', TRUE)
       ON CONFLICT (email) DO UPDATE
         SET password_hash  = EXCLUDED.password_hash,
             role           = 'admin',
             email_verified = TRUE`,
      [adminEmail, 'Zenith Admin', hash]
    );
    console.log(`[DB] Admin account ready at: ${adminEmail}`);
  } finally {
    client.release();
  }
}

// ── Run init EAGERLY at module load (not lazily on first query) ───────────────
// This ensures the DB is fully ready before any request arrives.
export const dbReady: Promise<void> = doInit().catch(err => {
  console.error('[DB] Init failed:', err);
  process.exit(1);
});

// ── Pool wrapper ──────────────────────────────────────────────────────────────
export const pool = {
  query: async (text: string, params?: unknown[]) => {
    await dbReady; // wait for init to finish
    const result = await pgPool.query(text, params);
    return {
      rows: result.rows as Record<string, unknown>[],
      rowCount: result.rowCount ?? 0,
    };
  },
};
