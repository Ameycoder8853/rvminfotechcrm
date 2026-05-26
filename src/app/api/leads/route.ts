import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

// GET /api/leads — List leads
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    // Role-Based Access Control (RBAC) Hierarchy Filters
    if (dbUser.roleTier === "junior") {
      filter.assignedTo = dbUser._id;
    } else if (dbUser.roleTier === "senior" && dbUser.teamId) {
      const teamUserIds = await User.find({ teamId: dbUser.teamId }).select("_id");
      filter.assignedTo = { $in: teamUserIds.map((u) => u._id) };
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate("assignedTo", "firstName lastName")
        .populate("customer", "firstName lastName company")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Lead.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, data: leads, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/leads — Create a lead
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    if (Array.isArray(body)) {
      const formatted = body.map((item: any) => ({
        title: item.title || "Imported Lead",
        company: item.company || "",
        value: Number(item.value || 0),
        status: item.status || "new",
        source: item.source || "website",
        priority: item.priority || "medium",
        createdBy: dbUser._id,
        assignedTo: item.assignedTo || dbUser._id,
      }));
      const leads = await Lead.insertMany(formatted);
      return NextResponse.json({ success: true, count: leads.length, data: leads }, { status: 201 });
    }

    const lead = await Lead.create({ ...body, createdBy: dbUser._id });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
