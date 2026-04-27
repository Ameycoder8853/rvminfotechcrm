import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Installation from "@/models/Installation";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const installations = await Installation.find(filter)
      .populate("customer", "firstName lastName company")
      .populate("order", "orderNumber")
      .populate("assignedTo", "firstName lastName")
      .sort({ scheduledDate: 1 })
      .lean();

    return NextResponse.json({ success: true, data: installations });
  } catch (error) {
    console.error("GET /api/installations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const installation = await Installation.create({
      ...body,
      createdBy: dbUser._id,
    });

    return NextResponse.json({ success: true, data: installation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/installations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
