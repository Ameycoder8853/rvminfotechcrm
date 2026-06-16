import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import DiaryEntry from "@/models/DiaryEntry";
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
    
    const entry = await DiaryEntry.findOneAndUpdate({ _id: id, ...baseFilter }, body, { new: true })
      .populate("customer", "firstName lastName company");

    if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("PATCH /api/diary/[id] error:", error);
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

    const entry = await DiaryEntry.findOneAndDelete({ _id: id, ...baseFilter });

    if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Entry deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/diary/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
