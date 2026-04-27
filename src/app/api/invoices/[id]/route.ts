import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";

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

    const invoice = await Invoice.findByIdAndUpdate(id, body, { new: true })
      .populate("customer", "firstName lastName company");

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error("PATCH /api/invoices/[id] error:", error);
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

    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/invoices/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
