import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Organization from "@/models/Organization";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    
    const filter: Record<string, any> = { isActive: true };
    if (dbUser && dbUser.roleTier !== "super_admin") {
      if (dbUser.orgId) {
        filter.orgId = dbUser.orgId;
      } else {
        // Self-healing: assign user to a default organization if none exists
        let org = await Organization.findOne({ status: "active" });
        if (!org) {
          org = await Organization.create({ name: "Default Org", slug: "default", status: "active" });
        }
        dbUser.orgId = org._id as any;
        await dbUser.save();
        filter.orgId = org._id;
      }
    }

    const users = await User.find(filter)
      .populate("teamId")
      .populate("parentManager", "firstName lastName")
      .lean();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
