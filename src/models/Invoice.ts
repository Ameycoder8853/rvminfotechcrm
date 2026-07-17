import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { tenantModel } from "@/lib/mongodb-tenant";

export interface IInvoice extends Document {
  invoiceNumber: string;
  order?: Types.ObjectId;
  customer: Types.ObjectId;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: "paid" | "unpaid" | "overdue" | "cancelled";
  dueDate: Date;
  issueDate: Date;
  notes: string;
  orgId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },

    invoiceNumber: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["paid", "unpaid", "overdue", "cancelled"],
      default: "unpaid",
    },
    dueDate: { type: Date, required: true },
    issueDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ customer: 1 });
InvoiceSchema.index({ status: 1 });

const Invoice: Model<IInvoice> = tenantModel<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
