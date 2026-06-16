import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Team from "@/models/Team";
import Organization from "@/models/Organization";
import mongoose from "mongoose";

/**
 * Programmatic enrollment API:
 * Admins can enroll Seniors.
 * Seniors can enroll Juniors (inheriting the Senior's orgId and teamId).
 * 
 * Flow:
 * 1. Authenticate the requester.
 * 2. Get requester's MongoDB record.
 * 3. Enforce role-based restrictions.
 * 4. Create user in Clerk.
 * 5. Create user in MongoDB.
 * 6. Rollback Clerk creation on MongoDB database failure.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: requesterClerkId } = await auth();
    if (!requesterClerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const requester = await User.findOne({ clerkId: requesterClerkId });
    if (!requester) {
      return NextResponse.json({ error: "Requester profile not found in DB" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { firstName, lastName, email, password, roleTier: requestedRoleTier, teamId, phone, orgId, permissions } = body;

    if (!email || !password || !firstName || !lastName || !requestedRoleTier) {
      return NextResponse.json({ error: "Missing required fields (email, password, firstName, lastName, roleTier)" }, { status: 400 });
    }

    // Role Enforcement Constraints
    let finalOrgId: mongoose.Types.ObjectId | undefined = requester.orgId;
    let finalTeamId: mongoose.Types.ObjectId | undefined = undefined;
    let finalParentManagerId: mongoose.Types.ObjectId | undefined = requester._id;

    // A. Requester is Super Admin (can add anyone anywhere)
    if (requester.roleTier === "super_admin") {
      if (requestedRoleTier === "super_admin") {
        finalOrgId = undefined;
        finalParentManagerId = undefined;
      } else {
        // Must specify orgId in req body for non-super_admin targets
        if (orgId) {
          finalOrgId = new mongoose.Types.ObjectId(orgId);
        }
        if (teamId) {
          finalTeamId = new mongoose.Types.ObjectId(teamId);
        }
      }
    } 
    // B. Requester is Company Admin (can add Seniors/Juniors to their own organization)
    else if (requester.roleTier === "admin") {
      if (requestedRoleTier !== "senior" && requestedRoleTier !== "junior") {
        return NextResponse.json({ error: "Company Admins can only enroll Seniors or Juniors" }, { status: 403 });
      }
      if (teamId) {
        const teamObj = await Team.findById(teamId);
        if (!teamObj || teamObj.orgId?.toString() !== requester.orgId?.toString()) {
          return NextResponse.json({ error: "Forbidden: Selected team does not belong to your organization" }, { status: 403 });
        }
        finalTeamId = teamObj._id;
      }
      finalParentManagerId = requester._id;
    } 
    // C. Requester is Senior (can only add Juniors to their own team/org)
    else if (requester.roleTier === "senior") {
      if (requestedRoleTier !== "junior") {
        return NextResponse.json({ error: "Seniors can only enroll Juniors" }, { status: 403 });
      }
      finalTeamId = requester.teamId; // Inherited
      finalParentManagerId = requester._id;

      // Enforce permission levels limit for Seniors
      if (permissions) {
        const seniorTeam = requester.teamId ? await Team.findById(requester.teamId) : null;
        const LEVELS = { none: 0, read: 1, write: 2, all: 3 };
        const getLevel = (val: string) => LEVELS[val as keyof typeof LEVELS] ?? 0;

        for (const key of ["leads", "customers", "invoices", "tickets"]) {
          if (permissions[key]) {
            const authorizerLevelStr = (requester.permissions as any)?.[key] || (seniorTeam?.permissions as any)?.[key] || "none";
            if (getLevel(permissions[key]) > getLevel(authorizerLevelStr)) {
              return NextResponse.json({ 
                error: `Forbidden: Cannot assign "${permissions[key]}" permission on "${key}" because it exceeds your own permission level ("${authorizerLevelStr}")` 
              }, { status: 403 });
            }
          }
        }
      }
    } 
    // D. Juniors cannot enroll anyone
    else {
      return NextResponse.json({ error: "Juniors do not have authorization to enroll staff" }, { status: 403 });
    }

    const clerk = await clerkClient();

    // 1. Programmatically Create User in Clerk
    let clerkUser;
    try {
      clerkUser = await clerk.users.createUser({
        emailAddress: [email],
        password: password,
        firstName: firstName,
        lastName: lastName,
        publicMetadata: {
          roleTier: requestedRoleTier,
          orgId: finalOrgId ? finalOrgId.toString() : "",
        },
      });
    } catch (clerkError: any) {
      console.error("Clerk creation error:", clerkError);
      return NextResponse.json({ error: clerkError.errors?.[0]?.message || "Clerk account creation failed" }, { status: 400 });
    }

    // 2. Create User in MongoDB
    try {
      const newUser = await User.create({
        clerkId: clerkUser.id,
        email: email.toLowerCase(),
        firstName,
        lastName,
        role: requestedRoleTier === "admin" ? "admin" : "sales",
        roleTier: requestedRoleTier,
        orgId: finalOrgId,
        teamId: finalTeamId,
        parentManager: finalParentManagerId,
        phone: phone || "",
        isActive: true,
        permissions: permissions || undefined,
      });

      return NextResponse.json({ success: true, user: newUser }, { status: 201 });
    } catch (mongoError: any) {
      console.error("MongoDB creation error. Rolling back Clerk account...", mongoError);
      
      // Rollback Clerk creation
      try {
        await clerk.users.deleteUser(clerkUser.id);
      } catch (rollbackError) {
        console.error("CRITICAL: Failed to rollback Clerk account deletion:", rollbackError);
      }

      return NextResponse.json({ error: mongoError.message || "Database mapping failed. Registration rolled back." }, { status: 500 });
    }
  } catch (error: any) {
    console.error("POST /api/users/enroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
