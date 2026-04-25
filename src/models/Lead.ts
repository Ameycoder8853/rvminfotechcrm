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
  status: string;
  priority: string;
  value: number;
  notes: ILeadNote[];
  followUpDate?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadNoteSchema = new Schema<ILeadNote>({
  text: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const LeadSchema = new Schema<ILead>(
  {
    title: { type: String, required: true },
    source: {
      type: String,
      enum: ["website", "referral", "cold_call", "social_media", "exhibition", "other"],
      default: "other",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    customer: { type: Schema.Types.ObjectId, ref: "Contact" },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    value: { type: Number, default: 0 },
    notes: [LeadNoteSchema],
    followUpDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

LeadSchema.index({ status: 1, assignedTo: 1 });
LeadSchema.index({ createdAt: -1 });

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;
