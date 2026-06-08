import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Server Supabase client bound to the request cookies (App Router). Returns null
 * when Supabase isn't configured. Uses the getAll/setAll cookie interface
 * required by current @supabase/ssr versions. Wire this up when adding auth.
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component without a writable cookie store;
          // safe to ignore when session refresh happens in middleware/route handlers.
        }
      },
    },
  });
}
