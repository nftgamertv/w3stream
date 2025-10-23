// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabaseClients/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  if (!code) {
    return NextResponse.json({ error: "Authorization code is missing" }, { status: 400 });
  }

  const supabase = await createClient();

  // IMPORTANT: pass an object { code } — not a raw string
  const { data, error } = await supabase.auth.exchangeCodeForSession({ code });

  if (error) {
    console.error("Error exchanging code for session:", error.message);
    return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent(error.message)}`, origin), { status: 303 });
  }

  // With @supabase/ssr server client, exchangeCodeForSession writes cookies for you.
  // Do NOT call setSession here — it’s redundant and can break things.

  return NextResponse.redirect(new URL(redirectTo, origin), { status: 303 });
}
