import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

function isDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function positiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  try {
    const [invoicesResult, paymentsResult, expensesResult] = await Promise.all([
      supabase
        .from("invoices")
        .select(
          "id, invoice_number, project_id, client_id, amount, due_date, paid_amount, status, issue_date"
        )
        .order("issue_date", { ascending: false }),
      supabase
        .from("payments")
        .select(
          "id, invoice_id, project_id, client_id, amount, payment_date, payment_method, reference, notes"
        )
        .order("payment_date", { ascending: false }),
      supabase
        .from("expenses")
        .select(
          "id, project_id, category, description, amount, expense_date, approved"
        )
        .order("expense_date", { ascending: false }),
    ]);

    const firstError = invoicesResult.error || paymentsResult.error || expensesResult.error;
    if (firstError) {
      return NextResponse.json({ error: firstError.message }, { status: 500 });
    }

    return NextResponse.json({
      invoices: invoicesResult.data ?? [],
      payments: paymentsResult.data ?? [],
      expenses: expensesResult.data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load finance data." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  try {
    const body = await request.json();
    const type = body?.type;

    if (!["invoice", "payment", "expense"].includes(type)) {
      return NextResponse.json({ error: "type must be invoice, payment, or expense." }, { status: 400 });
    }

    if (type === "invoice") {
      const amount = positiveNumber(body.amount);
      if (!body.invoice_number?.trim()) {
        return NextResponse.json({ error: "Invoice number is required." }, { status: 400 });
      }
      if (!amount) {
        return NextResponse.json({ error: "Invoice amount must be greater than zero." }, { status: 400 });
      }
      if (body.issue_date && !isDate(body.issue_date)) {
        return NextResponse.json({ error: "issue_date must use YYYY-MM-DD." }, { status: 400 });
      }
      if (body.due_date && !isDate(body.due_date)) {
        return NextResponse.json({ error: "due_date must use YYYY-MM-DD." }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          invoice_number: body.invoice_number.trim(),
          project_id: body.project_id || null,
          client_id: body.client_id || null,
          amount,
          due_date: body.due_date || null,
          paid_amount: 0,
          status: "Pending",
          issue_date: body.issue_date || new Date().toISOString().slice(0, 10),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(data, { status: 201 });
    }

    if (type === "payment") {
      const amount = positiveNumber(body.amount);
      if (!amount) {
        return NextResponse.json({ error: "Payment amount must be greater than zero." }, { status: 400 });
      }
      if (body.payment_date && !isDate(body.payment_date)) {
        return NextResponse.json({ error: "payment_date must use YYYY-MM-DD." }, { status: 400 });
      }

      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          invoice_id: body.invoice_id || null,
          project_id: body.project_id || null,
          client_id: body.client_id || null,
          amount,
          payment_date: body.payment_date || new Date().toISOString().slice(0, 10),
          payment_method: body.payment_method?.trim() || null,
          reference: body.reference?.trim() || null,
          notes: body.notes?.trim() || null,
        })
        .select()
        .single();

      if (paymentError) {
        return NextResponse.json({ error: paymentError.message }, { status: 400 });
      }

      if (body.invoice_id) {
        const { data: invoice, error: invoiceError } = await supabase
          .from("invoices")
          .select("id, amount, paid_amount")
          .eq("id", body.invoice_id)
          .single();

        if (invoiceError) {
          return NextResponse.json({ error: invoiceError.message }, { status: 400 });
        }

        const newPaid = Math.min(
          Number(invoice.amount || 0),
          Number(invoice.paid_amount || 0) + amount
        );
        const newStatus =
          newPaid >= Number(invoice.amount || 0)
            ? "Paid"
            : newPaid > 0
              ? "Partially Paid"
              : "Pending";

        const { error: updateError } = await supabase
          .from("invoices")
          .update({ paid_amount: newPaid, status: newStatus })
          .eq("id", body.invoice_id);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 400 });
        }
      }

      return NextResponse.json(payment, { status: 201 });
    }

    const amount = positiveNumber(body.amount);
    if (!body.project_id) {
      return NextResponse.json({ error: "project_id is required for an expense." }, { status: 400 });
    }
    if (!body.category?.trim()) {
      return NextResponse.json({ error: "Expense category is required." }, { status: 400 });
    }
    if (!amount) {
      return NextResponse.json({ error: "Expense amount must be greater than zero." }, { status: 400 });
    }
    if (body.expense_date && !isDate(body.expense_date)) {
      return NextResponse.json({ error: "expense_date must use YYYY-MM-DD." }, { status: 400 });
    }

    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({
        project_id: body.project_id,
        category: body.category.trim(),
        description: body.description?.trim() || null,
        amount,
        expense_date: body.expense_date || new Date().toISOString().slice(0, 10),
        approved: Boolean(body.approved),
      })
      .select()
      .single();

    if (expenseError) {
      return NextResponse.json({ error: expenseError.message }, { status: 400 });
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, spent")
      .eq("id", body.project_id)
      .single();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 400 });
    }

    const { error: spendError } = await supabase
      .from("projects")
      .update({ spent: Number(project.spent || 0) + amount })
      .eq("id", body.project_id);

    if (spendError) {
      return NextResponse.json({ error: spendError.message }, { status: 400 });
    }

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save finance record." },
      { status: 500 }
    );
  }
}
