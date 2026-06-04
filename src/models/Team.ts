import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
  orgId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  permissions: {
    leads: "none" | "read" | "write" | "all";
    customers: "none" | "read" | "write" | "all";
    invoices: "none" | "read" | "write" | "all";
    tickets: "none" | "read" | "write" | "all";
  };
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    permissions: {
      leads: { type: String, enum: ["none", "read", "write", "all"], default: "all" },
      customers: { type: String, enum: ["none", "read", "write", "all"], default: "all" },
      invoices: { type: String, enum: ["none", "read", "write", "all"], default: "all" },
      tickets: { type: String, enum: ["none", "read", "write", "all"], default: "all" },
    },
  },
  { timestamps: true }
);

if (mongoose.models.Team) {
  delete (mongoose.models as any).Team;
}

const Team: Model<ITeam> = mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
