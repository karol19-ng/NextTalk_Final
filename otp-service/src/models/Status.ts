import mongoose, { Document, Schema } from "mongoose";

export interface IStatus extends Document {
  user: mongoose.Types.ObjectId;
  type: "image" | "video" | "text";
  content: string;
  caption?: string;
  bgColor?: string;
  viewedBy: mongoose.Types.ObjectId[];
  expiresAt: Date;
  createdAt: Date;
}

const StatusSchema = new Schema<IStatus>({
  user:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  type:      { type: String, enum: ["image","video","text"], required: true },
  content:   { type: String, required: true },
  caption:   { type: String },
  bgColor:   { type: String, default: "#6d28d9" },
  viewedBy:  [{ type: Schema.Types.ObjectId, ref: "User" }],
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

StatusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IStatus>("Status", StatusSchema);