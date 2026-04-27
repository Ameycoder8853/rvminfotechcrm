import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import DiaryEntry from "@/models/DiaryEntry";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    
    const filter: Record<string, unknown> = {};
    if (dbUser.role !== "admin") filter.user = dbUser._id;

    if (dateStr) {
      const date = new Date(dateStr);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const entries = await DiaryEntry.find(filter)
      .populate("customer", "firstName lastName company")
      .sort({ startTime: 1 })
      .lean();

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("GET /api/diary error:", error);
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
    const entry = await DiaryEntry.create({
      ...body,
      user: dbUser._id,
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/diary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
