import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";
import User from "@/models/User";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { getScopedFilter, getWriteOrgId } from "@/lib/rbac-filter";

// GET /api/enquiries — List enquiries
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const baseFilter = await getScopedFilter(req, dbUser);
    const filter: Record<string, unknown> = { ...baseFilter };

    const enquiries = await Enquiry.find(filter)
      .populate("assignedTo", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: enquiries });
  } catch (error) {
    console.error("GET /api/enquiries error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/enquiries — Create an enquiry
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    const writeOrgId = getWriteOrgId(req, dbUser);
    const enquiry = await Enquiry.create({ 
      ...body, 
      orgId: writeOrgId, 
      createdBy: dbUser._id 
    });

    return NextResponse.json({ success: true, data: enquiry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/enquiries error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
