import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Task from "../models/Task";
import Project from "../models/Project";
import Sprint from "../models/Sprint";
import { AuthRequest } from "../middleware/auth";

const isAssignedToTask = (task: any, userId: string) =>
  task.assignees.some((assignee: any) => String(assignee) === userId);

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, sprintId, assignee, status, priority } = req.query;
    const query: any = {};

    if (projectId) query.projectId = projectId;
    if (sprintId) query.sprintId = sprintId;
    if (assignee) query.assignees = assignee;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    let tasks = await Task.find(query).sort({ dueDate: 1 }).lean();

    if (req.user?.role === "Member") {
      tasks = tasks.filter((task) => isAssignedToTask(task, req.user!.id));
    }

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, sprintId, title, description, assignees, estimateHours, priority, status, dueDate, attachments, subtasks } = req.body;

    if (!projectId || !sprintId || !title || !description || !assignees || !dueDate) {
      return res.status(400).json({ message: "Required task fields are missing" });
    }

    const project = await Project.findById(projectId);
    const sprint = await Sprint.findById(sprintId);
    if (!project || !sprint) {
      return res.status(404).json({ message: "Project or sprint not found" });
    }

    const task = await Task.create({
      projectId,
      sprintId,
      title,
      description,
      assignees,
      estimateHours: estimateHours || 0,
      priority: priority || "medium",
      status: status || "todo",
      dueDate,
      attachments: Array.isArray(attachments) ? attachments : [],
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      comments: [],
      activityLog: [],
      timeLogs: [],
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user?.role === "Member" && !isAssignedToTask(task, req.user.id)) {
      return res.status(403).json({ message: "You can only view your own assigned tasks" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { title, description, assignees, estimateHours, priority, status, dueDate, attachments, subtasks } = req.body;
    const changedStatus = status && status !== task.status;

    if (title) task.title = title;
    if (description) task.description = description;
    if (assignees !== undefined) task.assignees = assignees;
    if (estimateHours !== undefined) task.estimateHours = estimateHours;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;
    if (attachments !== undefined) task.attachments = attachments;
    if (subtasks !== undefined) task.subtasks = subtasks;

    if (changedStatus) {
      task.activityLog.push({
        userId: new mongoose.Types.ObjectId(req.user!.id),
        status: status,
        note: `Status changed to ${status}`,
        createdAt: new Date(),
      });
    }

    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await task.deleteOne();
    res.json({ message: "Task removed successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const isAssigned = isAssignedToTask(task, String(userId));
    if (req.user?.role === "Member" && !isAssigned) {
      return res.status(403).json({ message: "You can only update assigned tasks" });
    }

    if (status === "done" && task.status === "review" && !["Admin", "Manager"].includes(req.user!.role)) {
      return res.status(403).json({ message: "Only Admin or Manager can approve review tasks to done" });
    }

    if (req.user?.role === "Member" && status === "done" && task.status !== "review") {
      return res.status(403).json({ message: "Members can only move review tasks to review or progress, not directly to done" });
    }

    task.status = status;
    task.activityLog.push({
      userId,
      status,
      note: `Status updated to ${status}`,
      createdAt: new Date(),
    });

    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const addTaskComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Comment message is required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user?.role === "Member" && !isAssignedToTask(task, req.user.id)) {
      return res.status(403).json({ message: "You can only comment on your assigned tasks" });
    }

    task.comments.push({
      userId: new mongoose.Types.ObjectId(req.user!.id),
      message,
      createdAt: new Date(),
    });

    await task.save();
    res.status(201).json(task.comments);
  } catch (error) {
    next(error);
  }
};

export const addTaskTimeLog = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { hours, note, date } = req.body;
    if (hours === undefined || hours === null || !date) {
      return res.status(400).json({ message: "Hours and date are required for time logs" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user?.role === "Member" && !isAssignedToTask(task, req.user.id)) {
      return res.status(403).json({ message: "You can only add time logs to your assigned tasks" });
    }

    task.timeLogs.push({
      userId: new mongoose.Types.ObjectId(req.user!.id),
      hours,
      note: note || "",
      date,
    });

    await task.save();
    res.status(201).json(task.timeLogs);
  } catch (error) {
    next(error);
  }
};
