import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import CallLog from "@/models/CallLog";
import EmailLog from "@/models/EmailLog";
import { getScopedFilter } from "@/lib/rbac-filter";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

// DELETE /api/comms/[id] — Delete comm log (call or email)
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

    // Check if it's a Call Log first
    let deleted = await CallLog.findOneAndDelete({ _id: id, ...baseFilter });

    // If not found, check if it's an Email Log
    if (!deleted) {
      deleted = await EmailLog.findOneAndDelete({ _id: id, ...baseFilter });
    }

    if (!deleted) {
      return NextResponse.json({ error: "Log entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Communication log deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/comms/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
