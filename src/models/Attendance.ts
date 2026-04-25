import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAttendance extends Document {
  user: Types.ObjectId;
  type: "check_in" | "check_out";
  timestamp: Date;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  notes: string;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["check_in", "check_out"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

AttendanceSchema.index({ user: 1, timestamp: -1 });
AttendanceSchema.index({ type: 1, timestamp: -1 });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
