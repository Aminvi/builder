import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = typeof email === "string" ? email.trim() : "";

    if (!cleanEmail || typeof password !== "string" || !password) {
      return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return NextResponse.json(
        { error: "Supabase is not configured on this server. Check .env.local and restart Next.js." },
        { status: 500 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return NextResponse.json(
        {
          error: error.message || "Supabase rejected the sign-in.",
          code: "code" in error ? error.code : null,
          supabaseStatus: "status" in error ? error.status : null,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      ok: true,
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
