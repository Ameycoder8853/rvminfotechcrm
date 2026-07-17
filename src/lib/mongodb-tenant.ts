import mongoose, { Connection, Schema, Model } from "mongoose";
import { AsyncLocalStorage } from "async_hooks";
import Organization from "@/models/Organization";

export const tenantStorage = new AsyncLocalStorage<{ connection: Connection }>();

declare global {
  // eslint-disable-next-line no-var
  var tenantConnections: Map<string, Connection> | undefined;
}

const connectionCache = global.tenantConnections ?? new Map<string, Connection>();

if (!global.tenantConnections) {
  global.tenantConnections = connectionCache;
}

/**
 * Resolves or establishes a Mongoose connection instance for the specified tenant organization.
 */
export async function getTenantConnection(orgId: string): Promise<Connection> {
  if (connectionCache.has(orgId)) {
    return connectionCache.get(orgId)!;
  }

  // Fetch organization settings from the global default database
  const org = await Organization.findById(orgId).lean();
  if (org && org.dbConnectionString) {
    try {
      console.log(`[DB] Establishing custom tenant connection for org: ${org.name} (${orgId})`);
      const conn = mongoose.createConnection(org.dbConnectionString, {
        bufferCommands: false,
      });
      
      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        conn.once("open", () => resolve());
        conn.once("error", (err) => reject(err));
      });

      connectionCache.set(orgId, conn);
      return conn;
    } catch (err) {
      console.error(`[DB] Failed to establish custom tenant connection for org: ${org.name}, falling back to default`, err);
    }
  }

  // Fallback to default connection
  return mongoose.connection;
}

/**
 * Higher-order helper that wraps a default model definition in a Proxy.
 * All constructor instantiations (new Model()) and static operations (Model.find())
 * are dynamically routed to the tenant connection if active in request context.
 */
export function tenantModel<T>(modelName: string, schema: Schema): Model<T> {
  // 1. Compile the default model on the default mongoose instance
  const DefaultModel = mongoose.models[modelName] || mongoose.model(modelName, schema);

  return new Proxy(DefaultModel, {
    // Intercept constructor calls: new Lead(...)
    construct(target, args) {
      const store = tenantStorage.getStore();
      if (store && store.connection) {
        const TenantModel = store.connection.models[modelName] || store.connection.model(modelName, schema);
        return Reflect.construct(TenantModel, args);
      }
      return Reflect.construct(target, args);
    },

    // Intercept static methods/properties: Lead.find(), Lead.create(), etc.
    get(target, prop, receiver) {
      const store = tenantStorage.getStore();
      if (store && store.connection) {
        const TenantModel = store.connection.models[modelName] || store.connection.model(modelName, schema);
        const value = Reflect.get(TenantModel, prop, receiver);
        if (typeof value === "function") {
          return value.bind(TenantModel);
        }
        return value;
      }
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    }
  }) as unknown as Model<T>;
}
