import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional because we might not send it to the client
  role: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
  },
  {
    timestamps: true,
  }
);

// Prevent Next.js HMR from recompiling the model every time
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
