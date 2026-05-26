import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/models/Team";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

// GET /api/teams/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const team = await Team.findById(id).lean();

    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error("GET /api/teams/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/teams/[id]
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
    const team = await Team.findByIdAndUpdate(id, body, { new: true });

    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error("PATCH /api/teams/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/teams/[id]
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
    if (!dbUser || dbUser.roleTier !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const team = await Team.findByIdAndDelete(id);

    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Team deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/teams/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
