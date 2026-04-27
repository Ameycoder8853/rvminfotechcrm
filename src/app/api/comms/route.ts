import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import CallLog from "@/models/CallLog";
import EmailLog from "@/models/EmailLog";
import User from "@/models/User";

// Call Logs GET/POST
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "calls" or "emails"

    if (type === "emails") {
      const emails = await EmailLog.find()
        .populate("customer", "firstName lastName company")
        .populate("user", "firstName lastName")
        .sort({ createdAt: -1 })
        .lean();
      return NextResponse.json({ success: true, data: emails });
    }

    const calls = await CallLog.find()
      .populate("customer", "firstName lastName company")
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: calls });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await User.findOne({ clerkId: userId });
    const body = await req.json();
    const logType = body.logType; // "call" or "email"

    if (logType === "email") {
      const email = await EmailLog.create({ ...body, user: dbUser._id });
      return NextResponse.json({ success: true, data: email });
    }

    const call = await CallLog.create({ ...body, user: dbUser._id });
    return NextResponse.json({ success: true, data: call });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
