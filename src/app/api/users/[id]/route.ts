import { auth, clerkClient } from "@clerk/nextjs/server";
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
    const isAdmin = dbUser && (dbUser.roleTier === "admin" || dbUser.roleTier === "super_admin");
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Admin or Super Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    
    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Update local database fields
    if (body.roleTier) {
      user.roleTier = body.roleTier;
      // Synchronize role field if tier is admin or super_admin
      if (body.roleTier === "admin" || body.roleTier === "super_admin") {
        user.role = "admin";
      } else if (body.role) {
        user.role = body.role;
      }
    } else if (body.role) {
      user.role = body.role;
    }
    
    if (body.isActive !== undefined) user.isActive = body.isActive;
    if (body.teamId !== undefined) user.teamId = body.teamId;
    if (body.parentManager !== undefined) user.parentManager = body.parentManager;
    if (body.phone !== undefined) user.phone = body.phone;

    await user.save();

    // Sync updated role metadata to Clerk
    try {
      if (user.clerkId) {
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(user.clerkId, {
          publicMetadata: {
            roleTier: user.roleTier,
            role: user.role
          }
        });
        console.log(`[Clerk] Successfully synced updated metadata for user ${user.clerkId}`);
      }
    } catch (clerkErr) {
      console.warn("Failed to sync updated metadata to Clerk on PATCH:", clerkErr);
    }

    const populatedUser = await User.findById(id)
      .populate("teamId")
      .populate("parentManager", "firstName lastName");

    return NextResponse.json({ success: true, data: populatedUser });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
