import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

/**
 * Gets the MongoDB user record for the currently authenticated Clerk user.
 * If no record exists (e.g., webhook not fired in local dev), it creates one automatically.
 * This ensures the app works in local development without requiring ngrok / webhook setup.
 */
export async function getOrCreateDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  await connectToDatabase();

  // Try to find existing user by clerkId
  let dbUser = await User.findOne({ clerkId: userId });
  if (dbUser) {
    // Self-healing: if role was changed to admin in the database, promote roleTier to admin as well
    if (dbUser.role === "admin" && dbUser.roleTier === "junior") {
      dbUser.roleTier = "admin";
      await dbUser.save();
    }
    return dbUser;
  }

  // Fallback: Fetch full Clerk details only when creation/linking is required (slower, but one-time)
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // Look up by email (fallback to link existing DB account)
  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress || "";
  dbUser = await User.findOne({ email: primaryEmail.toLowerCase() });

  if (dbUser) {
    dbUser.clerkId = clerkUser.id;
    if (clerkUser.imageUrl) dbUser.avatar = clerkUser.imageUrl;
    await dbUser.save();
    console.log(`[DB] Successfully linked existing user ${primaryEmail} to clerkId ${clerkUser.id}`);
  } else {
    // Create new user if email doesn't exist
    dbUser = await User.create({
      clerkId: clerkUser.id,
      email: primaryEmail.toLowerCase(),
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      avatar: clerkUser.imageUrl || "",
      role: (clerkUser.publicMetadata?.role as string) || "admin",
      roleTier: (clerkUser.publicMetadata?.role as string) || (clerkUser.publicMetadata?.roleTier as any) || "admin",
      isActive: true,
    });
    console.log(`[DB] Auto-created user record for ${primaryEmail}`);
  }

  return dbUser;
}
