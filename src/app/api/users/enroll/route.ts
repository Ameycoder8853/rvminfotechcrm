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

    const { firstName, lastName, email, password, roleTier: requestedRoleTier, teamId } = await req.json();

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
        const body = await req.json().catch(() => ({}));
        if (body.orgId) {
          finalOrgId = new mongoose.Types.ObjectId(body.orgId);
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
        finalTeamId = new mongoose.Types.ObjectId(teamId);
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
        isActive: true,
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
