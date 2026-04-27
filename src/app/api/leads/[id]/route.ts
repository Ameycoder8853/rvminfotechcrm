import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";

// GET /api/leads/[id] — Get single lead
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const lead = await Lead.findById(id).populate("assignedTo", "firstName lastName").lean();

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error("GET /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/leads/[id] — Update lead
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    
    const lead = await Lead.findByIdAndUpdate(id, body, { new: true }).populate("assignedTo", "firstName lastName");

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error("PATCH /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/leads/[id] — Delete lead
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
