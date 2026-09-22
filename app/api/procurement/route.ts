import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const statuses = [
  "Pending Approval",
  "Approved",
  "Ordered",
  "Partially Delivered",
  "Delivered",
  "Cancelled",
] as const;

type ProcurementStatus = (typeof statuses)[number];

export async function GET() {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from("procurement_orders")
      .select("*, project:projects(id,name)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("GET /api/procurement error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load procurement orders." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const body = await request.json();
    const itemDescription = String(body?.item_description ?? "").trim();
    const quantity = Number(body?.quantity ?? 0);
    const unitPrice = Number(body?.unit_price ?? 0);
    const status = (body?.status || "Pending Approval") as ProcurementStatus;

    if (!itemDescription) {
      return NextResponse.json({ error: "Item description is required." }, { status: 400 });
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than 0." }, { status: 400 });
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return NextResponse.json({ error: "Unit price cannot be negative." }, { status: 400 });
    }
    if (!statuses.includes(status)) {
      return NextResponse.json({ error: "Invalid procurement status." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("procurement_orders")
      .insert({
        order_number: String(body?.order_number ?? "").trim() || `PO-${Date.now()}`,
        project_id: body?.project_id || null,
        supplier_name: String(body?.supplier_name ?? "").trim() || null,
        item_description: itemDescription,
        quantity,
        unit_price: unitPrice,
        total_amount: quantity * unitPrice,
        status,
        order_date: body?.order_date || new Date().toISOString().slice(0, 10),
        expected_delivery_date: body?.expected_delivery_date || null,
        notes: String(body?.notes ?? "").trim() || null,
      })
      .select("*, project:projects(id,name)")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/procurement error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create procurement order." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Procurement order id is required." }, { status: 400 });

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if ("status" in body) {
      if (!statuses.includes(body.status as ProcurementStatus)) {
        return NextResponse.json({ error: "Invalid procurement status." }, { status: 400 });
      }

      const { data: currentOrder, error: currentOrderError } = await supabase
        .from("procurement_orders")
        .select("status")
        .eq("id", id)
        .single();

      if (currentOrderError) throw currentOrderError;

      const transitions: Record<string, string[]> = {
        "Pending Approval": ["Approved", "Cancelled"],
        "Approved": ["Ordered", "Cancelled"],
        "Ordered": ["Partially Delivered", "Delivered"],
        "Partially Delivered": ["Delivered"],
        "Delivered": [],
        "Cancelled": [],
      };

      // Make repeated UI requests safe: updating an order to its current
      // status is a no-op rather than a hard failure.
      if (currentOrder.status === body.status) {
        const { data } = await supabase
          .from("procurement_orders")
          .select("*, project:projects(id,name)")
          .eq("id", id)
          .single();
        return NextResponse.json(data);
      }

      const allowed = transitions[currentOrder.status] ?? [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `Cannot change status from ${currentOrder.status} to ${body.status}.` },
          { status: 400 },
        );
      }

      updates.status = body.status;
    }

    for (const field of ["supplier_name", "item_description", "order_date", "expected_delivery_date", "notes"]) {
      if (field in body) updates[field] = String(body[field] ?? "").trim() || null;
    }
    if ("project_id" in body) updates.project_id = body.project_id || null;
    if ("quantity" in body) {
      const quantity = Number(body.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ error: "Quantity must be greater than 0." }, { status: 400 });
      updates.quantity = quantity;
    }
    if ("unit_price" in body) {
      const unitPrice = Number(body.unit_price);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) return NextResponse.json({ error: "Unit price cannot be negative." }, { status: 400 });
      updates.unit_price = unitPrice;
    }
    if ("quantity" in updates || "unit_price" in updates) {
      const { data: current, error: currentError } = await supabase
        .from("procurement_orders")
        .select("quantity,unit_price")
        .eq("id", id)
        .single();
      if (currentError) throw currentError;
      updates.total_amount = Number(updates.quantity ?? current.quantity) * Number(updates.unit_price ?? current.unit_price);
    }

    const { data, error } = await supabase
      .from("procurement_orders")
      .update(updates)
      .eq("id", id)
      .select("*, project:projects(id,name)")
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH /api/procurement error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update procurement order." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Procurement order id is required." }, { status: 400 });

    const { error } = await supabase
      .from("procurement_orders")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/procurement error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete procurement order." },
      { status: 500 },
    );
  }
}
