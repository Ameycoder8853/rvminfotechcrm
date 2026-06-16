import User from "@/models/User";
import mongoose from "mongoose";

/**
 * Returns a strict query filter for fetching records (leads, customers, tickets, tasks)
 * based on the authenticated user's role and hierarchy.
 * 
 * Hierarchy Rules:
 * - super_admin: Can see everything across all organizations.
 * - admin (Company Admin): Can see everything within their organization (orgId).
 * - senior: Can see tasks within their team (teamId) and only their own tasks or the tasks of juniors who report directly to them.
 * - junior: Can only see their own assigned/created tasks.
 * 
 * No Vice Versa is strictly enforced.
 */
export async function getAccessFilter(dbUser: any, impersonateOrgId?: string): Promise<Record<string, any>> {
  if (!dbUser) {
    throw new Error("User context is required for access control");
  }

  // 1. Super Admin bypasses all checks or optionally filters by selected tenant organization (impersonation)
  if (dbUser.roleTier === "super_admin") {
    if (impersonateOrgId) {
      return { orgId: new mongoose.Types.ObjectId(impersonateOrgId) };
    }
    // Restrict to their assigned organization if they have one. Otherwise, see no records.
    if (dbUser.orgId) {
      return { orgId: new mongoose.Types.ObjectId(dbUser.orgId) };
    }
    return { _id: new mongoose.Types.ObjectId() }; // Empty query (forces no results)
  }

  // Ensure organization context exists for non-super admins
  if (!dbUser.orgId) {
    return { _id: new mongoose.Types.ObjectId() }; // Empty query (forces no results)
  }

  const baseFilter: Record<string, any> = {
    orgId: new mongoose.Types.ObjectId(dbUser.orgId)
  };

  // 2. Company Admin (admin) sees all records inside their organization
  if (dbUser.roleTier === "admin") {
    return baseFilter;
  }

  // 3. Senior sees their own records + records of juniors reporting directly to them
  if (dbUser.roleTier === "senior") {
    // Find juniors reporting to this senior
    const juniors = await User.find({ parentManager: dbUser._id }).select("_id");
    const juniorIds = juniors.map(j => j._id);

    // Filter to their specific team & check ownership
    if (dbUser.teamId) {
      baseFilter.teamId = new mongoose.Types.ObjectId(dbUser.teamId);
    }

    baseFilter.$or = [
      { assignedTo: dbUser._id },
      { createdBy: dbUser._id },
      { assignedTo: { $in: juniorIds } },
      { createdBy: { $in: juniorIds } }
    ];
    return baseFilter;
  }

  // 4. Junior is strictly confined to their own records
  if (dbUser.roleTier === "junior") {
    baseFilter.$or = [
      { assignedTo: dbUser._id },
      { createdBy: dbUser._id }
    ];
    return baseFilter;
  }

  // Fallback to absolute security (no access)
  return { _id: new mongoose.Types.ObjectId() };
}
