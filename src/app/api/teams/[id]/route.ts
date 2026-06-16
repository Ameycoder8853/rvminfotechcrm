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
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const team = await Team.findById(id).lean();
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Enforce multi-tenancy context
    if (dbUser.roleTier !== "super_admin" && team.orgId?.toString() !== dbUser.orgId?.toString()) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    // Senior sees only their assigned team
    if (dbUser.roleTier === "senior" && dbUser.teamId?.toString() !== team._id.toString()) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    // Junior cannot access teams details
    if (dbUser.roleTier === "junior") {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

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
    if (!dbUser || (dbUser.roleTier !== "admin" && dbUser.roleTier !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const teamObj = await Team.findById(id);
    if (!teamObj) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Validate organization context
    if (dbUser.roleTier !== "super_admin" && teamObj.orgId?.toString() !== dbUser.orgId?.toString()) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const body = await req.json();
    // Strip out orgId updates for non-super-admins
    if (dbUser.roleTier !== "super_admin") {
      delete body.orgId;
    }

    const team = await Team.findByIdAndUpdate(id, body, { new: true });

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
    if (!dbUser || (dbUser.roleTier !== "admin" && dbUser.roleTier !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const teamObj = await Team.findById(id);
    if (!teamObj) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Validate organization context
    if (dbUser.roleTier !== "super_admin" && teamObj.orgId?.toString() !== dbUser.orgId?.toString()) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const team = await Team.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Team deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/teams/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
