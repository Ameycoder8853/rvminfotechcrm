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
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin = dbUser.roleTier === "admin" || dbUser.roleTier === "super_admin";
    const isSenior = dbUser.roleTier === "senior";

    if (!isAdmin && !isSenior) {
      return NextResponse.json({ error: "Unauthorized: Admin or Senior access required" }, { status: 403 });
    }

    const body = await req.json();
    
    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Senior manager access scoping check:
    if (isSenior) {
      const isJuniorInSameTeam = user.roleTier === "junior" && 
        ((user.teamId && user.teamId.toString() === dbUser.teamId?.toString()) || 
         (user.parentManager && user.parentManager.toString() === dbUser._id.toString()));
      
      if (!isJuniorInSameTeam) {
        return NextResponse.json({ error: "Unauthorized: Seniors can only modify Juniors in their own team" }, { status: 403 });
      }

      if (body.roleTier && body.roleTier !== "junior") {
        return NextResponse.json({ error: "Unauthorized: Seniors cannot promote user tiers" }, { status: 403 });
      }
    }

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

    // Super Admin edits
    if (dbUser.roleTier === "super_admin") {
      if (body.orgId !== undefined) {
        user.orgId = body.orgId ? body.orgId : undefined;
      }
      if (body.firstName !== undefined) user.firstName = body.firstName;
      if (body.lastName !== undefined) user.lastName = body.lastName;
      if (body.email !== undefined) user.email = body.email.toLowerCase();
    }

    if (body.permissions !== undefined) {
      // Clear out empty string values to inherit from team defaults
      const cleanedPermissions = { ...body.permissions };
      for (const key of Object.keys(cleanedPermissions)) {
        if (cleanedPermissions[key] === "") {
          delete cleanedPermissions[key];
        }
      }
      user.permissions = cleanedPermissions;
    }

    await user.save();

    // Sync updated role metadata to Clerk
    try {
      if (user.clerkId) {
        const clerk = await clerkClient();
        
        // Update Clerk Profile names if modified by Super Admin
        if (dbUser.roleTier === "super_admin" && (body.firstName !== undefined || body.lastName !== undefined)) {
          try {
            await clerk.users.updateUser(user.clerkId, {
              firstName: user.firstName,
              lastName: user.lastName
            });
          } catch (profileErr) {
            console.warn("[Clerk] Failed to update user profile names:", profileErr);
          }
        }

        await clerk.users.updateUserMetadata(user.clerkId, {
          publicMetadata: {
            roleTier: user.roleTier,
            role: user.role,
            orgId: user.orgId ? user.orgId.toString() : ""
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

// DELETE /api/users/[id] — Permanently delete a user from MongoDB and Clerk
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
    if (!dbUser || dbUser.roleTier !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
    }

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 1. Delete user from Clerk
    if (user.clerkId) {
      try {
        const clerk = await clerkClient();
        await clerk.users.deleteUser(user.clerkId);
        console.log(`[Clerk] Deleted user account ${user.clerkId}`);
      } catch (clerkErr) {
        console.warn("[Clerk] Failed to delete user in Clerk:", clerkErr);
      }
    }

    // 2. Delete user from MongoDB
    await User.findByIdAndDelete(id);
    console.log(`[DB] Deleted user document ${id}`);

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
