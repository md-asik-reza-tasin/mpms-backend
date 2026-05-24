import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  title: string;
  client: string;
  description: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: "planned" | "active" | "completed" | "archived";
  thumbnail?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    client: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ["planned", "active", "completed", "archived"],
      default: "planned",
    },
    thumbnail: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>("Project", ProjectSchema);
