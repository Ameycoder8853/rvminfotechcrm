import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (dbUser.role === "service_tech") filter.assignedTech = dbUser._id;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter).populate("customer", "firstName lastName company").populate("assignedTech", "firstName lastName").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Ticket.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, data: tickets, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
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
    const ticket = await Ticket.create({
      ...body,
      ticketNumber: generateId("TKT"),
      createdBy: dbUser._id,
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
