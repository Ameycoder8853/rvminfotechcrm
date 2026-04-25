import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDiaryEntry extends Document {
  user: Types.ObjectId;
  title: string;
  description: string;
  type: string;
  date: Date;
  startTime: string;
  endTime: string;
  customer?: Types.ObjectId;
  location: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiaryEntrySchema = new Schema<IDiaryEntry>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["task", "meeting", "reminder", "visit"],
      default: "task",
    },
    date: { type: Date, required: true },
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
    customer: { type: Schema.Types.ObjectId, ref: "Contact" },
    location: { type: String, default: "" },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DiaryEntrySchema.index({ user: 1, date: 1 });
DiaryEntrySchema.index({ type: 1, isCompleted: 1 });

const DiaryEntry: Model<IDiaryEntry> =
  mongoose.models.DiaryEntry ||
  mongoose.model<IDiaryEntry>("DiaryEntry", DiaryEntrySchema);

export default DiaryEntry;
