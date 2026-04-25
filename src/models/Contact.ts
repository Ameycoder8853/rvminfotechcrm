import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInteraction {
  type: string;
  description: string;
  date: Date;
  createdBy: Types.ObjectId;
}

export interface IAttachment {
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  company: string;
  emails: string[];
  phones: string[];
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  tags: string[];
  attachments: IAttachment[];
  interactions: IInteraction[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InteractionSchema = new Schema<IInteraction>({
  type: { type: String, enum: ["call", "email", "meeting", "note", "other"], default: "note" },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
});

const AttachmentSchema = new Schema<IAttachment>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const ContactSchema = new Schema<IContact>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    company: { type: String, default: "" },
    emails: [{ type: String }],
    phones: [{ type: String }],
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    tags: [{ type: String }],
    attachments: [AttachmentSchema],
    interactions: [InteractionSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ContactSchema.index({ firstName: "text", lastName: "text", company: "text" });

const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
