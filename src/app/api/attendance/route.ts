import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const filter: Record<string, unknown> = {};
    if (dbUser.role !== "admin") filter.user = dbUser._id;

    const records = await Attendance.find(filter)
      .populate("user", "firstName lastName")
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("GET /api/attendance error:", error);
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
    const record = await Attendance.create({
      user: dbUser._id,
      type: body.type,
      coordinates: body.coordinates,
      address: body.address || "",
      notes: body.notes || "",
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
