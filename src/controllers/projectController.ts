import { NextFunction, Request, Response } from "express";
import Project from "../models/Project";
import Task from "../models/Task";
import { AuthRequest } from "../middleware/auth";

const buildProjectStats = async (projectId: string) => {
  const totalTasks = await Task.countDocuments({ projectId });
  const completedTasks = await Task.countDocuments({ projectId, status: "done" });
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  return { totalTasks, completedTasks, progressPercent };
};

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, client } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (client) query.client = { $regex: new RegExp(String(client), "i") };

    let projects = await Project.find(query).lean();

    if (req.user?.role === "Member") {
      const assignedTasks = await Task.find({ assignees: req.user.id }).select("projectId").lean();
      const projectIds = [...new Set(assignedTasks.map((task) => String(task.projectId)))];
      projects = projects.filter((project) => projectIds.includes(String(project._id)));
    }

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => ({
        ...project,
        ...(await buildProjectStats(String(project._id))),
      }))
    );

    res.json(projectsWithStats);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, client, description, startDate, endDate, budget, status, thumbnail } = req.body;

    if (!title || !client || !description || !startDate || !endDate || budget === undefined) {
      return res.status(400).json({ message: "Required project fields are missing" });
    }

    const project = await Project.create({
      title,
      client,
      description,
      startDate,
      endDate,
      budget,
      status: status || "planned",
      thumbnail,
      createdBy: req.user?.id,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.user?.role === "Member") {
      const assignedTask = await Task.findOne({ projectId: project._id, assignees: req.user.id });
      if (!assignedTask) {
        return res.status(403).json({ message: "You can only view projects assigned to you" });
      }
    }

    const stats = await buildProjectStats(String(project._id));
    res.json({ ...project, ...stats });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { title, client, description, startDate, endDate, budget, status, thumbnail } = req.body;
    if (title) project.title = title;
    if (client) project.client = client;
    if (description) project.description = description;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (budget !== undefined) project.budget = budget;
    if (status) project.status = status;
    if (thumbnail !== undefined) project.thumbnail = thumbnail;

    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    await project.deleteOne();
    res.json({ message: "Project removed successfully" });
  } catch (error) {
    next(error);
  }
};
