import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Expense from "@/models/Expense";
import User from "@/models/User";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { getScopedFilter, getWriteOrgId } from "@/lib/rbac-filter";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const baseFilter = await getScopedFilter(req, dbUser);
    const filter: Record<string, unknown> = { ...baseFilter };
    if (dbUser.roleTier !== "admin" && dbUser.roleTier !== "super_admin") filter.user = dbUser._id;

    const expenses = await Expense.find(filter)
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const writeOrgId = getWriteOrgId(req, dbUser);
    const expense = await Expense.create({ ...body, orgId: writeOrgId, user: dbUser._id });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
