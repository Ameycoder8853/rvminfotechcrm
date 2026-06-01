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

export interface ICustomer extends Document {
  firstName: string;
  lastName: string;
  company: string;
  email?: string;
  phone?: string;
  city?: string;
  status?: string;
  source?: string;
  gender?: string;
  state?: string;
  district?: string;
  subLocation?: string;
  department?: string;
  designation?: string;
  workAddress?: string;
  workPhone?: string;
  workPinCode?: string;
  websiteUrl?: string;
  product?: string;
  category?: string;
  subCategory?: string;
  reference?: string;
  classification?: string;
  group?: string;
  zone?: string;
  contactType?: string;
  dob?: string;
  planDate?: string;
  planActionType?: string;
  remarks?: string;
  additionalNotes?: string;
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
  assignedTo?: Types.ObjectId; // Reference to assigned Junior sales rep
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

const CustomerSchema = new Schema<ICustomer>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    company: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    city: { type: String, default: "" },
    emails: [{ type: String }],
    phones: [{ type: String }],
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    status: { type: String, default: "Lead" },
    source: { type: String, default: "website" },
    gender: { type: String, default: "" },
    state: { type: String, default: "" },
    district: { type: String, default: "" },
    subLocation: { type: String, default: "" },
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    workAddress: { type: String, default: "" },
    workPhone: { type: String, default: "" },
    workPinCode: { type: String, default: "" },
    websiteUrl: { type: String, default: "" },
    product: { type: String, default: "" },
    category: { type: String, default: "" },
    subCategory: { type: String, default: "" },
    reference: { type: String, default: "" },
    classification: { type: String, default: "" },
    group: { type: String, default: "" },
    zone: { type: String, default: "" },
    contactType: { type: String, default: "" },
    dob: { type: String, default: "" },
    planDate: { type: String, default: "" },
    planActionType: { type: String, default: "" },
    remarks: { type: String, default: "" },
    additionalNotes: { type: String, default: "" },
    tags: [{ type: String }],
    attachments: [AttachmentSchema],
    interactions: [InteractionSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CustomerSchema.index({ firstName: "text", lastName: "text", company: "text" });

if (mongoose.models.Customer) {
  delete (mongoose.models as any).Customer;
}

const Customer: Model<ICustomer> = mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
