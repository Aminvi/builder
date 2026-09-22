import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const supabase = await createServerSupabaseClient();
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid project id." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      name,
      location,
      budget,
      spent,
      manager,
      description,
      start_date,
      end_date,
      status,
      progress,
    } = body;

    const updates: Record<string, unknown> = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return NextResponse.json(
          { error: "Project name is required." },
          { status: 400 }
        );
      }
      updates.name = String(name).trim();
    }

    if (location !== undefined) {
      updates.location = String(location).trim();
    }

    if (manager !== undefined) {
      updates.manager = String(manager).trim();
    }

    if (description !== undefined) {
      updates.description = String(description).trim();
    }

    if (start_date !== undefined) {
      updates.start_date = start_date || null;
    }

    if (end_date !== undefined) {
      updates.end_date = end_date || null;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    if (budget !== undefined) {
      const cleanBudget = Number(budget);
      if (Number.isNaN(cleanBudget) || cleanBudget < 0) {
        return NextResponse.json(
          { error: "Budget must be a valid non-negative number." },
          { status: 400 }
        );
      }
      updates.budget = cleanBudget;
    }

    if (spent !== undefined) {
      const cleanSpent = Number(spent);
      if (Number.isNaN(cleanSpent) || cleanSpent < 0) {
        return NextResponse.json(
          { error: "Spent must be a valid non-negative number." },
          { status: 400 }
        );
      }
      updates.spent = cleanSpent;
    }

    if (progress !== undefined) {
      const cleanProgress = Number(progress);
      if (
        Number.isNaN(cleanProgress) ||
        cleanProgress < 0 ||
        cleanProgress > 100
      ) {
        return NextResponse.json(
          { error: "Progress must be between 0 and 100." },
          { status: 400 }
        );
      }
      updates.progress = cleanProgress;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PATCH /api/projects/[id] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH /api/projects/[id] error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update project.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const supabase = await createServerSupabaseClient();
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid project id." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE /api/projects/[id] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete project.",
      },
      { status: 500 }
    );
  }
}
