import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";
import Organization from "@/models/Organization";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

// GET /api/teams — Fetch all teams
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    
    const query: Record<string, any> = {};
    if (dbUser) {
      if (dbUser.roleTier === "super_admin") {
        // Super Admins can list all teams or filter by orgId parameter
        const orgIdParam = req.nextUrl.searchParams.get("orgId");
        if (orgIdParam) {
          query.orgId = orgIdParam;
        }
      } else if (dbUser.orgId) {
        query.orgId = dbUser.orgId;
      } else {
        // Self-healing: create a default organization if none exists and assign it to user
        let org = await Organization.findOne({ status: "active" });
        if (!org) {
          org = await Organization.create({ name: "Default Org", slug: "default", status: "active" });
        }
        dbUser.orgId = org._id as any;
        await dbUser.save();
        query.orgId = org._id;
      }

      // Senior sees only their assigned team
      if (dbUser.roleTier === "senior") {
        if (dbUser.teamId) {
          query._id = dbUser.teamId;
        } else {
          return NextResponse.json({ success: true, data: [] });
        }
      }

      // Junior cannot view teams list
      if (dbUser.roleTier === "junior") {
        return NextResponse.json({ error: "Forbidden: Junior users cannot access teams list" }, { status: 403 });
      }
    }

    const teams = await Team.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: teams });
  } catch (error) {
    console.error("GET /api/teams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/teams — Create a new dynamic team
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser || (dbUser.roleTier !== "admin" && dbUser.roleTier !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized: Admin or Super Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { seniorManager, ...teamData } = body;
    
    // Inject and enforce orgId
    if (dbUser.roleTier !== "super_admin") {
      teamData.orgId = dbUser.orgId;
    } else if (!teamData.orgId) {
      if (dbUser.orgId) {
        teamData.orgId = dbUser.orgId;
      } else {
        let org = await Organization.findOne({ status: "active" });
        if (!org) {
          org = await Organization.create({ name: "Default Org", slug: "default", status: "active" });
        }
        teamData.orgId = org._id;
        dbUser.orgId = org._id as any;
        await dbUser.save();
      }
    }

    const team = await Team.create(teamData);

    // If seniorManager is requested, enroll them
    if (seniorManager) {
      const { firstName, lastName, email, password, phone } = seniorManager;
      
      if (!email || !password || !firstName || !lastName) {
        await Team.findByIdAndDelete(team._id);
        return NextResponse.json({ error: "Missing required Senior Manager fields" }, { status: 400 });
      }

      const clerk = await clerkClient();
      let clerkUser;
      try {
        clerkUser = await clerk.users.createUser({
          emailAddress: [email],
          password: password,
          firstName: firstName,
          lastName: lastName,
          publicMetadata: {
            roleTier: "senior",
            orgId: team.orgId ? team.orgId.toString() : "",
          },
        });
      } catch (clerkError: any) {
        console.error("Clerk creation error for senior in team POST:", clerkError);
        await Team.findByIdAndDelete(team._id);
        return NextResponse.json({ error: clerkError.errors?.[0]?.message || "Clerk account creation failed for Senior Manager." }, { status: 400 });
      }

      try {
        await User.create({
          clerkId: clerkUser.id,
          email: email.toLowerCase(),
          firstName,
          lastName,
          role: "sales",
          roleTier: "senior",
          orgId: team.orgId,
          teamId: team._id,
          parentManager: dbUser.roleTier === "super_admin" ? undefined : dbUser._id,
          phone: phone || "",
          isActive: true,
        });
      } catch (mongoError: any) {
        console.error("MongoDB creation error for senior in team POST. Rolling back...", mongoError);
        try {
          await clerk.users.deleteUser(clerkUser.id);
        } catch (rollbackError) {
          console.error("CRITICAL: Failed to rollback Clerk account deletion:", rollbackError);
        }
        await Team.findByIdAndDelete(team._id);
        return NextResponse.json({ error: mongoError.message || "Database mapping failed for Senior Manager. Registration rolled back." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
