import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const STATUSES = ["Operational", "Maintenance", "Out of Service"];
const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return errorResponse(error.message, 500);
    return NextResponse.json(data ?? []);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to load equipment.", 500);
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const equipmentNumber = String(body?.equipment_number ?? "").trim();
    const category = String(body?.category ?? "").trim();
    const projectId = body?.project_id || null;
    const status = String(body?.status ?? "Operational");
    const condition = String(body?.condition ?? "Good");

    if (!name) return errorResponse("Equipment name is required.");
    if (!equipmentNumber) return errorResponse("Equipment number is required.");
    if (!category) return errorResponse("Equipment category is required.");
    if (!STATUSES.includes(status)) return errorResponse("Invalid equipment status.");
    if (!CONDITIONS.includes(condition)) return errorResponse("Invalid equipment condition.");

    const payload = {
      name,
      equipment_number: equipmentNumber,
      category,
      project_id: projectId,
      status,
      condition,
      last_service_date: body?.last_service_date || null,
      next_service_date: body?.next_service_date || null,
    };

    const { data, error } = await supabase
      .from("equipment")
      .insert(payload)
      .select()
      .single();

    if (error) return errorResponse(error.message, 400);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to create equipment.", 500);
  }
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return errorResponse("Equipment id is required.");

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body?.name !== undefined) updates.name = String(body.name).trim();
    if (body?.equipment_number !== undefined) updates.equipment_number = String(body.equipment_number).trim();
    if (body?.category !== undefined) updates.category = String(body.category).trim();
    if (body?.project_id !== undefined) updates.project_id = body.project_id || null;
    if (body?.status !== undefined) {
      const status = String(body.status);
      if (!STATUSES.includes(status)) return errorResponse("Invalid equipment status.");
      updates.status = status;
    }
    if (body?.condition !== undefined) {
      const condition = String(body.condition);
      if (!CONDITIONS.includes(condition)) return errorResponse("Invalid equipment condition.");
      updates.condition = condition;
    }
    if (body?.last_service_date !== undefined) updates.last_service_date = body.last_service_date || null;
    if (body?.next_service_date !== undefined) updates.next_service_date = body.next_service_date || null;

    if (Object.keys(updates).length === 0) return errorResponse("No equipment changes supplied.");

    const { data, error } = await supabase
      .from("equipment")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return errorResponse(error.message, 400);
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to update equipment.", 500);
  }
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return errorResponse("Equipment id is required.");

    const { error } = await supabase
      .from("equipment")
      .delete()
      .eq("id", id);

    if (error) return errorResponse(error.message, 400);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to delete equipment.", 500);
  }
}
