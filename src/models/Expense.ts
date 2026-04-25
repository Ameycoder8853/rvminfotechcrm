import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IExpense extends Document {
  user: Types.ObjectId;
  category: string;
  amount: number;
  description: string;
  receiptUrl: string;
  date: Date;
  status: string;
  approvedBy?: Types.ObjectId;
  approvalNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["travel", "food", "accommodation", "supplies", "other"],
      default: "other",
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    receiptUrl: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvalNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

ExpenseSchema.index({ user: 1, status: 1 });
ExpenseSchema.index({ status: 1, createdAt: -1 });

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
