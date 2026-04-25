import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProgressPhoto {
  url: string;
  caption: string;
  uploadedAt: Date;
}

export interface IInstallation extends Document {
  customer: Types.ObjectId;
  order?: Types.ObjectId;
  assignedTo: Types.ObjectId;
  scheduledDate: Date;
  status: string;
  progressPhotos: IProgressPhoto[];
  notes: string;
  customerSignature: string;
  completedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressPhotoSchema = new Schema<IProgressPhoto>({
  url: { type: String, required: true },
  caption: { type: String, default: "" },
  uploadedAt: { type: Date, default: Date.now },
});

const InstallationSchema = new Schema<IInstallation>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
    progressPhotos: [ProgressPhotoSchema],
    notes: { type: String, default: "" },
    customerSignature: { type: String, default: "" },
    completedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

InstallationSchema.index({ status: 1, scheduledDate: 1 });
InstallationSchema.index({ assignedTo: 1, status: 1 });

const Installation: Model<IInstallation> =
  mongoose.models.Installation ||
  mongoose.model<IInstallation>("Installation", InstallationSchema);

export default Installation;
