import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Organization from "@/models/Organization";
import Team from "@/models/Team";
import User from "@/models/User";

/**
 * PATCH /api/organizations/[id]
 * Super Admins can update organization name, slug, and status.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    // Authorization Check
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser || dbUser.roleTier !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const org = await Organization.findById(id);
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const body = await req.json();

    if (body.name !== undefined) {
      org.name = body.name;
    }

    if (body.slug !== undefined) {
      const formattedSlug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (formattedSlug !== org.slug) {
        const exists = await Organization.findOne({ slug: formattedSlug });
        if (exists) {
          return NextResponse.json({ error: "Organization with this slug already exists" }, { status: 400 });
        }
        org.slug = formattedSlug;
      }
    }

    if (body.status !== undefined) {
      if (body.status !== "active" && body.status !== "suspended") {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      org.status = body.status;
    }

    if (body.dbConnectionString !== undefined) {
      org.dbConnectionString = body.dbConnectionString;
    }

    await org.save();

    return NextResponse.json({ success: true, data: org });
  } catch (error: any) {
    console.error("PATCH /api/organizations/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/organizations/[id]
 * Super Admins can delete an organization.
 * Cleans up associated teams and unassigns users.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    // Authorization Check
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser || dbUser.roleTier !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const org = await Organization.findById(id);
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // 1. Delete associated teams
    await Team.deleteMany({ orgId: id });

    // 2. Unassign users (dissolve their organization context safely)
    await User.updateMany(
      { orgId: id },
      {
        $unset: { orgId: "", teamId: "", parentManager: "" },
        $set: { roleTier: "none" }
      }
    );

    // 3. Delete organization
    await Organization.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Organization and its teams deleted, users unassigned successfully." });
  } catch (error: any) {
    console.error("DELETE /api/organizations/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
