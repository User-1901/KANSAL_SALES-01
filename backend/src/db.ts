import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Database Connection ───────────────────────────────────────────────────────
// Uses PGlite for local development (SQLite-based PostgreSQL-compatible)
// For production, use process.env.DATABASE_URL to connect to real PostgreSQL
const dbPath = path.resolve(__dirname, '../../pgdata');

let db: PGlite;

async function initDatabase() {
  db = new PGlite(dbPath);
  await db.waitReady;
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function doInit() {
  await initDatabase();

  try {
    // Migration tracking table
    await db.query(`
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
    const usersExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      )
    `) as { rows: Array<{ exists: boolean }> };
    
    const migrationsCount = await db.query(
      `SELECT COUNT(*)::text AS count FROM _migrations`
    ) as { rows: Array<{ count: string }> };

    if (usersExists.rows[0]?.exists && migrationsCount.rows[0]?.count === '0') {
      // Existing DB with no tracker — mark all files as already applied
      for (const file of allFiles) {
        await db.query(
          `INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
          [file]
        );
      }
      console.log('[DB] Existing database detected — skipped migrations.');
    } else {
      // Fresh DB or incremental — run only unapplied migrations
      for (const file of allFiles) {
        const already = await db.query(
          `SELECT filename FROM _migrations WHERE filename = $1`, [file]
        ) as { rows: Array<{ filename: string }> };
        
        if (already.rows.length > 0) continue;

        const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        console.log(`[DB] Running migration: ${file}`);
        
        // Split by semicolons and execute each statement separately
        // (PGlite doesn't support multiple statements in one query)
        const statements = sqlContent
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        for (const stmt of statements) {
          await db.query(stmt);
        }
        
        await db.query(`INSERT INTO _migrations (filename) VALUES ($1)`, [file]);
      }
    }

    // ── Seed Default Admin Account ────────────────────────────────────────────────
    // SECURITY: Change these credentials immediately in production!
    // Replace with environment variables for real deployments
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@zenith-atelier.com';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe@123';
    const hash = await bcrypt.hash(adminPassword, 10);
    
    await db.query(
      `INSERT INTO users (email, display_name, password_hash, role, email_verified)
       VALUES ($1, $2, $3, 'admin', TRUE)
       ON CONFLICT (email) DO UPDATE
         SET password_hash  = EXCLUDED.password_hash,
             role           = 'admin',
             email_verified = TRUE`,
      [adminEmail, 'Zenith Admin', hash]
    );
    console.log(`[DB] Admin account ready at: ${adminEmail}`);
  } catch (error) {
    console.error('[DB] Init failed:', error);
    throw error;
  }
}

// ── Run init EAGERLY at module load (not lazily on first query) ───────────────
// This ensures the DB is fully ready before any request arrives.
export const dbReady: Promise<void> = doInit().catch(err => {
  console.error('[DB] Fatal error:', err);
  process.exit(1);
});

// ── Pool wrapper ──────────────────────────────────────────────────────────────
export const pool = {
  query: async (text: string, params?: unknown[]) => {
    await dbReady; // wait for init to finish
    const result = await db.query(text, params) as { rows: Array<Record<string, unknown>> };
    return {
      rows: result.rows,
      rowCount: result.rows.length,
    };
  },
  end: async () => {
    if (db) {
      await db.close();
    }
  },
};
