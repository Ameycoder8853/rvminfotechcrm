import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICallLog extends Document {
  user: Types.ObjectId;
  customer: Types.ObjectId;
  type: "inbound" | "outbound" | "missed";
  duration: number; // in seconds
  notes: string;
  outcome: string;
  timestamp: Date;
  createdAt: Date;
}

const CallLogSchema = new Schema<ICallLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
    type: {
      type: String,
      enum: ["inbound", "outbound", "missed"],
      required: true,
    },
    duration: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    outcome: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CallLog: Model<ICallLog> =
  mongoose.models.CallLog || mongoose.model<ICallLog>("CallLog", CallLogSchema);

export default CallLog;
