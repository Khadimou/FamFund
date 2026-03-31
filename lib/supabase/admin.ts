import { createClient } from '@supabase/supabase-js'

/** Client avec la service role key — à utiliser uniquement côté serveur, jamais exposé au client. */
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
