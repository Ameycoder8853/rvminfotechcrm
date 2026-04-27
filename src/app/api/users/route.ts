import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const users = await User.find({ isActive: true }).select("firstName lastName role avatar").lean();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
