import mongoose, { Document, Schema } from "mongoose";

export interface ISprint extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  sprintNumber: number;
  startDate: Date;
  endDate: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SprintSchema = new Schema<ISprint>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true },
    sprintNumber: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISprint>("Sprint", SprintSchema);
