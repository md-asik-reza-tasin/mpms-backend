import mongoose, { Document, Schema } from "mongoose";

interface IComment {
  userId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

interface IActivityLog {
  userId: mongoose.Types.ObjectId;
  status: string;
  note: string;
  createdAt: Date;
}

interface ITimeLog {
  userId: mongoose.Types.ObjectId;
  hours: number;
  note: string;
  date: Date;
}

interface ISubtask {
  title: string;
  completed: boolean;
}

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  sprintId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  assignees: mongoose.Types.ObjectId[];
  estimateHours: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "review" | "done";
  dueDate: Date;
  attachments: { url: string; name?: string }[];
  subtasks: ISubtask[];
  comments: IComment[];
  activityLog: IActivityLog[];
  timeLogs: ITimeLog[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true, trim: true },
    note: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TimeLogSchema = new Schema<ITimeLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hours: { type: Number, required: true, min: 0 },
    note: { type: String, default: "" },
    date: { type: Date, required: true },
  },
  { _id: false }
);

const SubtaskSchema = new Schema<ISubtask>(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    sprintId: { type: Schema.Types.ObjectId, ref: "Sprint", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    estimateHours: { type: Number, required: true, default: 0 },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      required: true,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
    },
    dueDate: { type: Date, required: true },
    attachments: [{ url: String, name: String }],
    subtasks: { type: [SubtaskSchema], default: [] },
    comments: { type: [CommentSchema], default: [] },
    activityLog: { type: [ActivityLogSchema], default: [] },
    timeLogs: { type: [TimeLogSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>("Task", TaskSchema);
