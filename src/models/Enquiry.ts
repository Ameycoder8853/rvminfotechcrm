import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IEnquiry extends Document {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  location?: string;
  status: string; // new, contacted, replied, closed
  priority: string; // low, medium, high, urgent
  source: string; // website, referral, cold_call, social_media, email_campaign, trade_show, partner, direct_mail, other
  details?: string; // Remarks / Details
  assignedTo?: Types.ObjectId; // Assigned manager (User)
  createdBy: Types.ObjectId; // Creator user
  orgId?: Types.ObjectId; // Organization tenant id
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String, default: "" },
    address: { type: String, default: "" },
    location: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "replied", "closed"],
      default: "new",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    source: {
      type: String,
      enum: [
        "website",
        "referral",
        "cold_call",
        "social_media",
        "email_campaign",
        "trade_show",
        "partner",
        "direct_mail",
        "other",
      ],
      default: "other",
    },
    details: { type: String, default: "" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

EnquirySchema.index({ createdAt: -1 });

if (mongoose.models.Enquiry) {
  delete (mongoose.models as any).Enquiry;
}

const Enquiry: Model<IEnquiry> = mongoose.model<IEnquiry>("Enquiry", EnquirySchema);

export default Enquiry;
