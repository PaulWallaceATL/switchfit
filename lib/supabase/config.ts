/**
 * Centralized Supabase env access. Everything is optional so the app runs fine
 * without Supabase configured (used while auth is bypassed during testing).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the public (browser-safe) Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** True when the server-only service role key is present (for privileged writes). */
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
