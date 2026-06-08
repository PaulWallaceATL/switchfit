import "server-only";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, isSupabaseAdminConfigured } from "@/lib/supabase/config";

/**
 * Privileged Supabase client using the service role key. SERVER ONLY — never
 * import this into client code. Bypasses RLS, so it is used for trusted writes
 * (e.g. persisting scans while auth is bypassed during testing). Returns null
 * when the service role key isn't configured.
 */
export function createSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) return null;

  return createClient(SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
