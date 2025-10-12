'use server'
import { createServerClient } from '@supabase/ssr'
 
 
// Admin client that ignores cookies and only uses service role
export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SB_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [] // Return empty array to prevent reading cookies
        },
        setAll() {
          // Do nothing to prevent setting cookies
        },
      },
    }
  )
}