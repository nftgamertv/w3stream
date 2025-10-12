import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read cookies from the original request
        getAll() {
          return request.cookies.getAll()
        },
        // Write cookies to the mutable response
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    }
  )

  // IMPORTANT: Do not add any code between createServerClient and supabase.auth.getUser().
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error("Auth error in middleware:", error.message)
      if (error.message.includes("Invalid Refresh Token") || error.status === 400) {
        await supabase.auth.signOut()
        for (const key of ['sb-access-token', 'sb-refresh-token']) {
          response.cookies.delete(key)
        }
      }
    } else {
      user = data.user
    }
  } catch (error) {
    console.error("Unexpected error in auth middleware:", error)
  }

  // Return the mutable response so that cookie changes propagate.
  return response
}
