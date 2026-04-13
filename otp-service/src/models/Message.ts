import mongoose, { Document, Schema } from "mongoose";

export type MessageType = "text" | "image" | "video" | "audio" | "file";
export type MessageStatus = "sent" | "delivered" | "read";

export interface IMessage extends Document {
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  mediaThumb?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  status: MessageStatus;
  readBy: mongoose.Types.ObjectId[];
  deliveredTo: mongoose.Types.ObjectId[];
  deleted: boolean;
  edited: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
    },
    content: { type: String, default: "" },
    mediaUrl: { type: String },
    mediaThumb: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    duration: { type: Number },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    deliveredTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
    deleted: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
