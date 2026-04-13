import mongoose, { Document, Schema } from "mongoose";

export interface IRegisteredPhone extends Document {
  phone: string;
  name: string;
  registeredAt: Date;
}

const RegisteredPhoneSchema = new Schema<IRegisteredPhone>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IRegisteredPhone>(
  "RegisteredPhone",
  RegisteredPhoneSchema
);
