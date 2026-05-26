import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IEmailLog extends Document {
  user: Types.ObjectId;
  customer: Types.ObjectId;
  subject: string;
  body: string;
  status: "sent" | "failed" | "opened";
  timestamp: Date;
  createdAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "failed", "opened"],
      default: "sent",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

if (mongoose.models.EmailLog) {
  delete (mongoose.models as any).EmailLog;
}

const EmailLog: Model<IEmailLog> = mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);

export default EmailLog;
