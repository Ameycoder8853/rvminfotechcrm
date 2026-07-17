import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { tenantModel } from "@/lib/mongodb-tenant";

export interface IQuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface IQuote extends Document {
  quoteNumber: string;
  customer: Types.ObjectId;
  lead?: Types.ObjectId;
  items: IQuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  status: string;
  validUntil: Date;
  notes: string;
  convertedToOrder?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  orgId?: mongoose.Types.ObjectId;
}

const QuoteItemSchema = new Schema<IQuoteItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  total: { type: Number, required: true },
});

const QuoteSchema = new Schema<IQuote>({
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },

    quoteNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead" },
    items: [QuoteItemSchema],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected", "converted"],
      default: "draft",
    },
    validUntil: { type: Date },
    notes: { type: String, default: "" },
    convertedToOrder: { type: Schema.Types.ObjectId, ref: "Order" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  }, { timestamps: true }
);

QuoteSchema.index({ quoteNumber: 1 });
QuoteSchema.index({ customer: 1, status: 1 });

const Quote: Model<IQuote> = tenantModel<IQuote>("Quote", QuoteSchema);

export default Quote;
