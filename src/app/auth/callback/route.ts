// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabaseClients/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";

  if (!code) {
    return NextResponse.json({ error: "Authorization code is missing" }, { status: 400 });
  }

  const supabase = await createClient();

  // Supabase v2 expects a string here
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Error exchanging code for session:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Cookies are set by the server client; just redirect.
  return NextResponse.redirect(new URL(redirectTo, url.origin), { status: 303 });
}
