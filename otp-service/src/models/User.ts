import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  phone: string;
  name: string;
  avatar?: string;
  status: string;
  online: boolean;
  lastSeen: Date;
  contacts: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    avatar: { type: String, default: "" },
    status: { type: String, default: "Hola, uso NextTalk" },
    online: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    contacts: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
