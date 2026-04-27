import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AMC from "@/models/AMC";

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
    
    const amc = await AMC.findByIdAndUpdate(id, body, { new: true })
      .populate("customer", "firstName lastName company");

    if (!amc) return NextResponse.json({ error: "AMC not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: amc });
  } catch (error) {
    console.error("PATCH /api/amc/[id] error:", error);
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

    const amc = await AMC.findByIdAndDelete(id);

    if (!amc) return NextResponse.json({ error: "AMC not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "AMC deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/amc/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
