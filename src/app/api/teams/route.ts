import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/models/Team";
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
      if (dbUser.orgId) {
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
    if (!dbUser || dbUser.roleTier !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    
    // Inject orgId into the body
    if (!body.orgId) {
      if (dbUser.orgId) {
        body.orgId = dbUser.orgId;
      } else {
        let org = await Organization.findOne({ status: "active" });
        if (!org) {
          org = await Organization.create({ name: "Default Org", slug: "default", status: "active" });
        }
        body.orgId = org._id;
        dbUser.orgId = org._id as any;
        await dbUser.save();
      }
    }

    const team = await Team.create(body);

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
