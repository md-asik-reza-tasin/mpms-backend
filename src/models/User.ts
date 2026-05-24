import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Manager" | "Member";
  department: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["Admin", "Manager", "Member"], default: "Member" },
    department: { type: String, default: "" },
    skills: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        const obj = ret as any;
        delete obj.password;
        delete obj.__v;
        return obj;
      },
    },
  }
);

export default mongoose.model<IUser>("User", UserSchema);
