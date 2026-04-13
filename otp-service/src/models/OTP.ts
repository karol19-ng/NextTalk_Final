import mongoose, { Document, Schema } from "mongoose";

export interface IOTP extends Document {
  phone: string;
  code: string;
  verified: boolean;
  attempts: number;
  expiresAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    phone: { type: String, required: true },
    code: { type: String, required: true },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model<IOTP>("OTP", OTPSchema);

export interface IRegisteredPhone extends Document {
  phone: string;
  name: string;
}

const RegisteredPhoneSchema = new Schema<IRegisteredPhone>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
  },
  { timestamps: true }
);

export const RegisteredPhone = mongoose.model<IRegisteredPhone>(
  "RegisteredPhone",
  RegisteredPhoneSchema
);
