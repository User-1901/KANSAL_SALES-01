import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// ── SECURITY BOUNDARY WARNING ───────────────────────────────────────────────
// THIS CLIENT RUNS IN THE BROWSER / CLIENT-SIDE.
// IT MUST ONLY USE THE PUBLIC PUBLISHABLE / ANON KEY (VITE_SUPABASE_PUBLISHABLE_KEY).
// NEVER IMPORT OR EXPOSE SUPABASE_SERVICE_ROLE_KEY IN THIS FILE OR ANY FRONTEND CODE!
// ─────────────────────────────────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase Client Warning] VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is not configured in environment.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
