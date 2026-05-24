import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Sprint from "../models/Sprint";
import Task from "../models/Task";
import Project from "../models/Project";
import { AuthRequest } from "../middleware/auth";

export const getSprintsByProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.user?.role === "Member") {
      const assignedTask = await Task.findOne({ projectId, assignees: req.user.id });
      if (!assignedTask) {
        return res.status(403).json({ message: "You can only view sprints for assigned projects" });
      }
    }

    const sprints = await Sprint.find({ projectId }).sort({ order: 1 });
    res.json(sprints);
  } catch (error) {
    next(error);
  }
};

export const createSprint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawProjectId = req.params.projectId;
    const projectId = Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId;
    const { title, startDate, endDate } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: "Title, startDate, and endDate are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const objectProjectId = new mongoose.Types.ObjectId(projectId as string);
    const sprintCount = await Sprint.countDocuments({ projectId: objectProjectId });
    const sprintNumber = sprintCount + 1;

    const sprint = await Sprint.create({
      projectId: objectProjectId,
      title,
      sprintNumber,
      startDate,
      endDate,
      order: sprintNumber,
    });

    res.status(201).json(sprint);
  } catch (error) {
    next(error);
  }
};

export const getSprintById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    if (req.user?.role === "Member") {
      const assignedTask = await Task.findOne({ sprintId: sprint._id, assignees: req.user.id });
      if (!assignedTask) {
        return res.status(403).json({ message: "You can only view sprints assigned to you" });
      }
    }

    res.json(sprint);
  } catch (error) {
    next(error);
  }
};

export const updateSprint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    const { title, startDate, endDate, order } = req.body;
    if (title) sprint.title = title;
    if (startDate) sprint.startDate = startDate;
    if (endDate) sprint.endDate = endDate;
    if (order !== undefined) sprint.order = order;

    await sprint.save();
    res.json(sprint);
  } catch (error) {
    next(error);
  }
};

export const deleteSprint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    await sprint.deleteOne();
    res.json({ message: "Sprint removed successfully" });
  } catch (error) {
    next(error);
  }
};
