import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import CallLog from "@/models/CallLog";
import EmailLog from "@/models/EmailLog";
import User from "@/models/User";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { getScopedFilter, getWriteOrgId } from "@/lib/rbac-filter";

// Call Logs GET/POST
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "calls" or "emails"

    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const baseFilter = await getScopedFilter(req, dbUser);

    if (type === "emails") {
      const emails = await EmailLog.find(baseFilter)
        .populate("customer", "firstName lastName company")
        .populate("user", "firstName lastName")
        .sort({ createdAt: -1 })
        .lean();
      return NextResponse.json({ success: true, data: emails });
    }

    const calls = await CallLog.find(baseFilter)
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
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User record not found" }, { status: 404 });

    const body = await req.json();
    const logType = body.logType; // "call" or "email"
    const writeOrgId = getWriteOrgId(req, dbUser);

    if (logType === "email") {
      const email = await EmailLog.create({ ...body, orgId: writeOrgId, user: dbUser._id });
      return NextResponse.json({ success: true, data: email });
    }

    const call = await CallLog.create({ ...body, orgId: writeOrgId, user: dbUser._id });
    return NextResponse.json({ success: true, data: call });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
