import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Organization from "@/models/Organization";
import User from "@/models/User";

/**
 * GET /api/organizations
 * Super Admins can list all tenant organizations.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Authorization Check
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser || dbUser.roleTier !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const organizations = await Organization.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: organizations });
  } catch (error: any) {
    console.error("GET /api/organizations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/organizations
 * Super Admins can register a new tenant organization.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Authorization Check
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser || dbUser.roleTier !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { name, slug, dbConnectionString } = await req.json();
    if (!name || !slug) {
       return NextResponse.json({ error: "Missing required fields (name, slug)" }, { status: 400 });
    }

    // Slug check
    const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const exists = await Organization.findOne({ slug: formattedSlug });
    if (exists) {
      return NextResponse.json({ error: "Organization with this slug already exists" }, { status: 400 });
    }

    const newOrg = await Organization.create({
      name,
      slug: formattedSlug,
      status: "active",
      dbConnectionString: dbConnectionString || ""
    });

    return NextResponse.json({ success: true, data: newOrg }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/organizations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
