import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { tenantModel } from "@/lib/mongodb-tenant";

export interface IServiceScheduleEntry {
  scheduledDate: Date;
  completedDate?: Date;
  technician?: Types.ObjectId;
  notes: string;
}

export interface IAMC extends Document {
  customer: Types.ObjectId;
  contractNumber: string;
  startDate: Date;
  endDate: Date;
  status: string;
  services: { description: string; frequency: string }[];
  orgId?: mongoose.Types.ObjectId;
  value: number;
  renewalReminder: Date;
  serviceSchedule: IServiceScheduleEntry[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceScheduleSchema = new Schema<IServiceScheduleEntry>({
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date },
  technician: { type: Schema.Types.ObjectId, ref: "User" },
  notes: { type: String, default: "" },
});

const AMCSchema = new Schema<IAMC>({
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },

    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    contractNumber: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "renewed", "cancelled"],
      default: "active",
    },
    services: [
      {
        description: { type: String, required: true },
        frequency: { type: String, enum: ["monthly", "quarterly", "half_yearly", "yearly"], default: "quarterly" },
      },
    ],
    value: { type: Number, default: 0 },
    renewalReminder: { type: Date },
    serviceSchedule: [ServiceScheduleSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  }, { timestamps: true }
);

AMCSchema.index({ contractNumber: 1 });
AMCSchema.index({ status: 1, endDate: 1 });

const AMC: Model<IAMC> = tenantModel<IAMC>("AMC", AMCSchema);

export default AMC;
