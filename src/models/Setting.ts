import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: any;
  orgId: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const SettingSchema: Schema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of key per organization
SettingSchema.index({ key: 1, orgId: 1 }, { unique: true });

import { tenantModel } from "@/lib/mongodb-tenant";

export default tenantModel<ISetting>("Setting", SettingSchema);
