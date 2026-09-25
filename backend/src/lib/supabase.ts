import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.js';

// ── SECURITY BOUNDARY WARNING ───────────────────────────────────────────────
// THIS IS A SERVER-SIDE SUPABASE CLIENT.
// IT USES THE SUPABASE SERVICE ROLE KEY (SUPABASE_SERVICE_ROLE_KEY) TO BYPASS RLS
// FOR PRIVILEGED BACKEND BUSINESS OPERATIONS (Order processing, Admin tasks, etc.).
//
// CRITICAL SECURITY RULES:
// 1. NEVER IMPORT THIS FILE INTO ANY FRONTEND / CLIENT-SIDE CODE.
// 2. NO FALLBACK: THIS CLIENT MUST REQUIRE THE SERVICE ROLE KEY. IT WILL NEVER
//    FALL BACK TO PUBLISHABLE/ANON KEYS.
// ─────────────────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!supabaseUrl) {
    throw new Error(
      '[Supabase Server Client Error] FATAL: SUPABASE_URL environment variable is not defined.'
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      '[Supabase Server Client Error] FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is not defined. ' +
      'The backend server requires the Service Role Key to perform admin and system operations safely. ' +
      'No fallback to publishable keys is permitted for server-side execution.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Lazy or initialized server client instance
let cachedAdminClient: SupabaseClient<Database> | null = null;

export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop: keyof SupabaseClient<Database>) {
    if (!cachedAdminClient) {
      cachedAdminClient = getSupabaseAdminClient();
    }
    const val = cachedAdminClient[prop];
    return typeof val === 'function' ? val.bind(cachedAdminClient) : val;
  },
});
