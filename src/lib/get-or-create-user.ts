import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

/**
 * Gets the MongoDB user record for the currently authenticated Clerk user.
 * If no record exists (e.g., webhook not fired in local dev), it creates one automatically.
 * This ensures the app works in local development without requiring ngrok / webhook setup.
 */
export async function getOrCreateDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  await connectToDatabase();

  // Try to find existing user
  let dbUser = await User.findOne({ clerkId: clerkUser.id });

  // If not found, create from Clerk data (handles local dev without webhooks)
  if (!dbUser) {
    const primaryEmail =
      clerkUser.emailAddresses[0]?.emailAddress || "";

    dbUser = await User.create({
      clerkId: clerkUser.id,
      email: primaryEmail,
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
