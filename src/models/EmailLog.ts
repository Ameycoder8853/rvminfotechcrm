import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { tenantModel } from "@/lib/mongodb-tenant";

export interface IEmailLog extends Document {
  user: Types.ObjectId;
  customer: Types.ObjectId;
  subject: string;
  body: string;
  status: "sent" | "failed" | "opened";
  timestamp: Date;
  createdAt: Date;

  orgId?: mongoose.Types.ObjectId;
}

const EmailLogSchema = new Schema<IEmailLog>({
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },

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
  }, { timestamps: true }
);

const EmailLog: Model<IEmailLog> = tenantModel<IEmailLog>("EmailLog", EmailLogSchema);

export default EmailLog;
