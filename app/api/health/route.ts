import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    return NextResponse.json({ ok: true, authenticated: Boolean(data.user), user: data.user?.email ?? null, supabaseAuthReachable: !error, timestamp: new Date().toISOString() }, { status: 200, headers: { "cache-control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Health check failed" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
