import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Expense from "@/models/Expense";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();
    
    const expense = await Expense.findByIdAndUpdate(id, body, { new: true }).populate("user", "firstName lastName");

    if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    console.error("PATCH /api/expenses/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
