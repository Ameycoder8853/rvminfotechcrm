import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AMC from "@/models/AMC";
import { getScopedFilter } from "@/lib/rbac-filter";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

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
    
    const amc = await AMC.findOneAndUpdate({ _id: id, ...baseFilter }, body, { new: true })
      .populate("customer", "firstName lastName company");

    if (!amc) return NextResponse.json({ error: "AMC not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: amc });
  } catch (error) {
    console.error("PATCH /api/amc/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    const amc = await AMC.findOneAndDelete({ _id: id, ...baseFilter });

    if (!amc) return NextResponse.json({ error: "AMC not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "AMC deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/amc/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
