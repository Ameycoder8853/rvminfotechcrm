import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "sales" | "service_tech" | "field_agent";
  roleTier: "super_admin" | "admin" | "senior" | "junior";
  orgId?: Types.ObjectId;
  teamId?: Types.ObjectId;
  parentManager?: Types.ObjectId;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  permissions?: {
    leads?: "none" | "read" | "write" | "all";
    customers?: "none" | "read" | "write" | "all";
    invoices?: "none" | "read" | "write" | "all";
    tickets?: "none" | "read" | "write" | "all";
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "sales", "service_tech", "field_agent"],
      default: "sales",
    },
    roleTier: {
      type: String,
      enum: ["super_admin", "admin", "senior", "junior"],
      default: "junior",
    },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization" },
    teamId: { type: Schema.Types.ObjectId, ref: "Team" },
    parentManager: { type: Schema.Types.ObjectId, ref: "User" },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    permissions: {
      leads: { type: String, enum: ["none", "read", "write", "all"] },
      customers: { type: String, enum: ["none", "read", "write", "all"] },
      invoices: { type: String, enum: ["none", "read", "write", "all"] },
      tickets: { type: String, enum: ["none", "read", "write", "all"] },
    },
  },
  { timestamps: true }
);

if (mongoose.models.User) {
  delete (mongoose.models as any).User;
}

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
