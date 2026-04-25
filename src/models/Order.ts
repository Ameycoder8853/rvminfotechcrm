import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IOrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: Types.ObjectId;
  quote?: Types.ObjectId;
  items: IOrderItem[];
  totalValue: number;
  status: string;
  department: string;
  assignedTo?: Types.ObjectId;
  deliveryDate?: Date;
  notes: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
    quote: { type: Schema.Types.ObjectId, ref: "Quote" },
    items: [OrderItemSchema],
    totalValue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    department: { type: String, default: "" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    deliveryDate: { type: Date },
    notes: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
