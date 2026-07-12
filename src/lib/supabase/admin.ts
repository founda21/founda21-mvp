import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for privileged operations only (e.g. bootstrapping the
// default "Founda21 Direct" institution account). Never expose this client
// or its key to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
