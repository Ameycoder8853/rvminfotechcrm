import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

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
    
    const ticket = await Ticket.findByIdAndUpdate(id, body, { new: true })
      .populate("customer", "firstName lastName company")
      .populate("assignedTech", "firstName lastName");

    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("PATCH /api/tickets/[id] error:", error);
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

    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/tickets/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
