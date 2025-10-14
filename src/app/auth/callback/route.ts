// File: auth/callback/route.ts

import {  createClient } from "@/utils/supabaseClients/server";
import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Authorization code is missing" }, { status: 400 });
  }

  // Exchange the code for a session
  const { data: session, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Error exchanging code for session:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Set the session in cookies
  if (session && session.session) {
    const { access_token, refresh_token } = session.session;
    supabase.auth.setSession({ access_token, refresh_token });
  }

  // Redirect to the specified URL or dashboard
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
