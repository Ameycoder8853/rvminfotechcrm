import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

/**
 * GET /api/users/me
 * Retrieves current logged-in user profile from MongoDB.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Using getOrCreateDbUser to guarantee synchronization in local dev
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // 1. Clerk Metadata Sync
    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      if (clerkUser) {
        const clerkRoleTier = clerkUser.publicMetadata?.roleTier as string;
        const clerkRole = clerkUser.publicMetadata?.role as string;
        
        let needsSave = false;
        
        if (clerkRoleTier && dbUser.roleTier !== clerkRoleTier) {
          dbUser.roleTier = clerkRoleTier as any;
          needsSave = true;
        }
        
        if (clerkRole && dbUser.role !== clerkRole) {
          dbUser.role = clerkRole as any;
          needsSave = true;
        }
        
        if (needsSave) {
          await dbUser.save();
          console.log(`[DB] Synced roleTier to ${dbUser.roleTier} and role to ${dbUser.role} from Clerk metadata`);
        }
      }
    } catch (clerkErr) {
      console.warn("Failed to sync Clerk metadata:", clerkErr);
    }

    // 2. Single User Auto-Promotion Self-Healing
    const activeCount = await User.countDocuments({ isActive: true });
    if (activeCount <= 1 && dbUser.roleTier !== "super_admin") {
      dbUser.roleTier = "super_admin";
      dbUser.role = "admin";
      await dbUser.save();
      console.log(`[DB] Auto-promoted single database user ${dbUser.email} to super_admin`);
      
      try {
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            roleTier: "super_admin",
            role: "super_admin"
          }
        });
      } catch (clerkErr) {
        console.warn("Failed to sync Clerk metadata during auto-promotion:", clerkErr);
      }
    }

    // 3. Manual Promotion Parameter Support
    const promoteParam = req.nextUrl.searchParams.get("promote");
    if (promoteParam === "super_admin" && dbUser.roleTier !== "super_admin") {
      dbUser.roleTier = "super_admin";
      dbUser.role = "admin";
      await dbUser.save();
      
      try {
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            roleTier: "super_admin",
            role: "super_admin"
          }
        });
        console.log(`[Clerk] Manually promoted user ${userId} to super_admin`);
      } catch (clerkErr) {
        console.error("Failed to manually promote Clerk metadata:", clerkErr);
      }
    }

    const populatedUser = await User.findById(dbUser._id).populate("teamId").lean();
    return NextResponse.json({ success: true, data: populatedUser });
  } catch (error: any) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
