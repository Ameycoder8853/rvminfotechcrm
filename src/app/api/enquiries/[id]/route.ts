import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";
import User from "@/models/User";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { getScopedFilter } from "@/lib/rbac-filter";

// GET /api/enquiries/[id] — Get single enquiry
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const baseFilter = await getScopedFilter(req, dbUser);
    const enquiry = await Enquiry.findOne({ _id: id, ...baseFilter })
      .populate("assignedTo", "firstName lastName")
      .lean();

    if (!enquiry) return NextResponse.json({ error: "Enquiry not found or access denied" }, { status: 404 });

    return NextResponse.json({ success: true, data: enquiry });
  } catch (error) {
    console.error("GET /api/enquiries/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/enquiries/[id] — Update enquiry
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const baseFilter = await getScopedFilter(req, dbUser);
    const body = await req.json();
    delete body.orgId;
    
    const enquiry = await Enquiry.findOneAndUpdate({ _id: id, ...baseFilter }, body, { new: true })
      .populate("assignedTo", "firstName lastName");

    if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: enquiry });
  } catch (error) {
    console.error("PATCH /api/enquiries/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/enquiries/[id] — Delete enquiry
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const baseFilter = await getScopedFilter(req, dbUser);
    const deletedEnquiry = await Enquiry.findOneAndDelete({ _id: id, ...baseFilter });
    if (!deletedEnquiry) return NextResponse.json({ error: "Enquiry not found or access denied" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/enquiries/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
