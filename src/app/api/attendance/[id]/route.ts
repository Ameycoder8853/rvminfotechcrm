import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    const record = await Attendance.findByIdAndDelete(id);

    if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/attendance/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
