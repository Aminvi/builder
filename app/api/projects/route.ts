import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("GET /api/projects error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET /api/projects error:", error);

    return NextResponse.json(
      { error: "Failed to load projects." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
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

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "Project name is required." },
        { status: 400 }
      );
    }

    const cleanBudget = Number(budget || 0);
    const cleanSpent = Number(spent || 0);
    const cleanProgress = Number(progress || 0);

    if (Number.isNaN(cleanBudget)) {
      return NextResponse.json(
        { error: "Budget must be a valid number." },
        { status: 400 }
      );
    }

    if (Number.isNaN(cleanSpent)) {
      return NextResponse.json(
        { error: "Spent amount must be a valid number." },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(cleanProgress) ||
      cleanProgress < 0 ||
      cleanProgress > 100
    ) {
      return NextResponse.json(
        {
          error: "Progress must be between 0 and 100.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: String(name).trim(),
        location: location ? String(location).trim() : "",
        budget: cleanBudget,
        spent: cleanSpent,
        manager: manager ? String(manager).trim() : "",
        description: description ? String(description).trim() : "",
        start_date: start_date || null,
        end_date: end_date || null,
        status: status || "On Track",
        progress: cleanProgress,
      })
      .select()
      .single();

    if (error) {
      console.error("POST /api/projects error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/projects error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create project.",
      },
      { status: 500 }
    );
  }
}

/*
 * UPDATE PROJECT
 * Uses:
 * /api/projects?id=<project-uuid>
 */
export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project id is required." },
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
          {
            error:
              "Budget must be a valid non-negative number.",
          },
          { status: 400 }
        );
      }

      updates.budget = cleanBudget;
    }

    if (spent !== undefined) {
      const cleanSpent = Number(spent);

      if (Number.isNaN(cleanSpent) || cleanSpent < 0) {
        return NextResponse.json(
          {
            error:
              "Spent must be a valid non-negative number.",
          },
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
          {
            error:
              "Progress must be between 0 and 100.",
          },
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
      console.error("PATCH /api/projects error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH /api/projects error:", error);

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

/*
 * DELETE PROJECT
 * Uses:
 * /api/projects?id=<project-uuid>
 */
export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project id is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("DELETE /api/projects error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: data,
    });
  } catch (error) {
    console.error("DELETE /api/projects error:", error);

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
