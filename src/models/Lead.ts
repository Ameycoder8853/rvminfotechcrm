import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ILeadNote {
  text: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

export interface ILead extends Document {
  title: string;
  source: string;
  assignedTo?: Types.ObjectId;
  customer?: Types.ObjectId;
  company?: string;
  status: string;
  priority: string;
  value: number;
  email?: string;
  phone?: string;
  webAddress?: string;
  address?: string;
  notes: ILeadNote[];
  followUpDate?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  orgId?: mongoose.Types.ObjectId;
}

const LeadNoteSchema = new Schema<ILeadNote>({
  text: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const LeadSchema = new Schema<ILead>({
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },

    title: { type: String, required: true },
    source: {
      type: String,
      enum: ["website", "referral", "cold_call", "social_media", "email_campaign", "trade_show", "partner", "direct_mail", "other"],
      default: "other",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    company: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "proposal", "won", "lost"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    value: { type: Number, default: 0 },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    webAddress: { type: String, default: "" },
    address: { type: String, default: "" },
    notes: [LeadNoteSchema],
    followUpDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  }, { timestamps: true }
);

LeadSchema.index({ status: 1, assignedTo: 1 });
LeadSchema.index({ createdAt: -1 });

import { tenantModel } from "@/lib/mongodb-tenant";

const Lead: Model<ILead> = tenantModel<ILead>("Lead", LeadSchema);

export default Lead;
