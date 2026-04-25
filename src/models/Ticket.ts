import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IServiceHistoryEntry {
  action: string;
  performedBy: Types.ObjectId;
  date: Date;
  notes: string;
}

export interface ITicket extends Document {
  ticketNumber: string;
  customer: Types.ObjectId;
  issueDescription: string;
  category: string;
  priority: string;
  status: string;
  assignedTech?: Types.ObjectId;
  resolutionNotes: string;
  serviceHistory: IServiceHistoryEntry[];
  createdBy: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceHistorySchema = new Schema<IServiceHistoryEntry>({
  action: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: "" },
});

const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
    issueDescription: { type: String, required: true },
    category: {
      type: String,
      enum: ["complaint", "service_request", "installation", "general"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "assigned", "in_progress", "resolved", "closed"],
      default: "open",
    },
    assignedTech: { type: Schema.Types.ObjectId, ref: "User" },
    resolutionNotes: { type: String, default: "" },
    serviceHistory: [ServiceHistorySchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

TicketSchema.index({ ticketNumber: 1 });
TicketSchema.index({ status: 1, priority: 1 });
TicketSchema.index({ assignedTech: 1, status: 1 });

const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;
