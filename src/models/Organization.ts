import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  slug: string; // Subdomain or identifier
  status: "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

if (mongoose.models.Organization) {
  delete (mongoose.models as any).Organization;
}

const Organization: Model<IOrganization> = mongoose.model<IOrganization>("Organization", OrganizationSchema);

export default Organization;
