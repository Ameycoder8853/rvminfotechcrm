import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";

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
    
    const quote = await Quote.findByIdAndUpdate(id, body, { new: true })
      .populate("customer", "firstName lastName company");

    if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: quote });
  } catch (error) {
    console.error("PATCH /api/quotes/[id] error:", error);
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

    const quote = await Quote.findByIdAndDelete(id);

    if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Quote deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/quotes/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
