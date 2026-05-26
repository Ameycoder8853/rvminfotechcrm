import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

// PATCH /api/users/[id] — Update user settings
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
    if (!dbUser || dbUser.roleTier !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    
    // We only permit updating roleTier, teamId, and parentManager fields
    const updates: Record<string, any> = {};
    if (body.roleTier) updates.roleTier = body.roleTier;
    if (body.teamId !== undefined) updates.teamId = body.teamId;
    if (body.parentManager !== undefined) updates.parentManager = body.parentManager;

    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .populate("teamId")
      .populate("parentManager", "firstName lastName");

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
