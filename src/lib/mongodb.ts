import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { getTenantConnection, tenantStorage } from "./mongodb-tenant";

const MONGODB_URI = process.env.MONGODB_URL || process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URL or MONGODB_URI environment variable inside .env.local"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase() {
  if (!cached.conn) {
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
        return mongooseInstance;
      });
    }

    try {
      cached.conn = await cached.promise;
    } catch (e) {
      cached.promise = null;
      throw e;
    }
  }

  // Resolve and activate custom tenant database connection context dynamically
  try {
    const { userId } = await auth();
    if (userId) {
      const User = mongoose.models.User || mongoose.model("User");
      if (User) {
        const dbUser = await User.findOne({ clerkId: userId }).lean();
        if (dbUser) {
          let orgId = dbUser.orgId?.toString();

          // Support super admin impersonation cookies
          if (dbUser.roleTier === "super_admin") {
            const cookieStore = await cookies();
            const impersonateOrgId = cookieStore.get("rvm_impersonate_org_id")?.value;
            if (impersonateOrgId) {
              orgId = impersonateOrgId;
            }
          }

          if (orgId) {
            const tenantConn = await getTenantConnection(orgId);
            tenantStorage.enterWith({ connection: tenantConn });
          }
        }
      }
    }
  } catch (err) {
    console.error("[DB] Tenant connection routing lookup failed, fallback to default:", err);
  }

  return cached.conn;
}
