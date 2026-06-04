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
        const clerkRole = (clerkUser.publicMetadata?.role as string) || (clerkUser.publicMetadata?.roleTier as string);
        if (clerkRole && (dbUser.roleTier !== clerkRole || (clerkRole === "admin" && dbUser.role !== "admin"))) {
          dbUser.roleTier = clerkRole as any;
          if (clerkRole === "admin" || clerkRole === "super_admin") {
            dbUser.role = "admin";
          }
          await dbUser.save();
          console.log(`[DB] Synced roleTier to ${clerkRole} from Clerk metadata`);
        }
      }
    } catch (clerkErr) {
      console.warn("Failed to sync Clerk metadata:", clerkErr);
    }

    // 2. Single User Auto-Promotion Self-Healing
    const activeCount = await User.countDocuments({ isActive: true });
    if (activeCount <= 1 && dbUser.roleTier !== "admin" && dbUser.roleTier !== "super_admin") {
      dbUser.roleTier = "admin";
      dbUser.role = "admin";
      await dbUser.save();
      console.log(`[DB] Auto-promoted single database user ${dbUser.email} to admin`);
    }

    return NextResponse.json({ success: true, data: dbUser });
  } catch (error: any) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
