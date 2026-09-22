import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = typeof email === "string" ? email.trim() : "";

    if (!cleanEmail || typeof password !== "string" || !password) {
      return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return NextResponse.json(
        { error: "Supabase is not configured on this server. Check .env.local and restart Next.js." },
        { status: 500 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      session: Boolean(data.session),
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      message: data.session
        ? "Account created."
        : "Account created. Check your email to confirm your account, then sign in.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the account.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
