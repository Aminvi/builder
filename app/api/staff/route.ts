import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  try {
    const [{ data: staff, error: staffError }, { data: attendance, error: attendanceError }] = await Promise.all([
      supabase.from("staff").select("*").order("created_at", { ascending: false }),
      supabase.from("attendance").select("*").order("attendance_date", { ascending: false }),
    ]);

    if (staffError) return jsonError(staffError.message, 500);
    if (attendanceError) return jsonError(attendanceError.message, 500);

    return NextResponse.json({ staff: staff ?? [], attendance: attendance ?? [] });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to load staff data.", 500);
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const body = await request.json();
    const type = String(body?.type || "").trim();

    if (type === "staff") {
      const name = String(body?.name || "").trim();
      const employee_number = String(body?.employee_number || "").trim();
      const role = String(body?.role || "").trim();
      const department = String(body?.department || "").trim();
      const phone = String(body?.phone || "").trim();
      const email = String(body?.email || "").trim();
      const status = String(body?.status || "Active").trim();

      if (!name) return jsonError("Staff name is required.");
      if (!employee_number) return jsonError("Employee number is required.");
      if (!role) return jsonError("Role is required.");

      const { data, error } = await supabase
        .from("staff")
        .insert({ employee_number, name, role, department, phone, email, status })
        .select()
        .single();

      if (error) return jsonError(error.message, 500);
      return NextResponse.json(data, { status: 201 });
    }

    if (type === "attendance") {
      const staff_id = String(body?.staff_id || "").trim();
      const attendance_date = String(body?.attendance_date || "").trim();
      const status = String(body?.status || "Present").trim();
      const check_in = body?.check_in || null;
      const check_out = body?.check_out || null;

      if (!staff_id) return jsonError("Staff member is required.");
      if (!attendance_date) return jsonError("Attendance date is required.");

      const { data: existing, error: findError } = await supabase
        .from("attendance")
        .select("id")
        .eq("staff_id", staff_id)
        .eq("attendance_date", attendance_date)
        .maybeSingle();

      if (findError) return jsonError(findError.message, 500);

      if (existing?.id) {
        const { data, error } = await supabase
          .from("attendance")
          .update({ status, check_in, check_out })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) return jsonError(error.message, 500);
        return NextResponse.json(data);
      }

      const { data, error } = await supabase
        .from("attendance")
        .insert({ staff_id, attendance_date, status, check_in, check_out })
        .select()
        .single();

      if (error) return jsonError(error.message, 500);
      return NextResponse.json(data, { status: 201 });
    }

    return jsonError("Invalid staff operation.");
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid request.");
  }
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type");
    const body = await request.json();

    if (!id) return jsonError("A record id is required.");

    if (type === "attendance") {
      const updates: Record<string, unknown> = {};
      for (const field of ["status", "check_in", "check_out", "attendance_date", "staff_id"]) {
        if (body?.[field] !== undefined) updates[field] = body[field];
      }

      const { data, error } = await supabase
        .from("attendance")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) return jsonError(error.message, 500);
      return NextResponse.json(data);
    }

    const updates: Record<string, unknown> = {};
    for (const field of ["employee_number", "name", "role", "department", "phone", "email", "status"]) {
      if (body?.[field] !== undefined) updates[field] = body[field];
    }

    if (updates.name !== undefined && !String(updates.name).trim()) {
      return jsonError("Staff name cannot be empty.");
    }

    const { data, error } = await supabase
      .from("staff")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return jsonError(error.message, 500);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid request.");
  }
}
