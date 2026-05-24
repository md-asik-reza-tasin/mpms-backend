import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Task from "../models/Task";
import Project from "../models/Project";

export const getProjectReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const totalTasks = await Task.countDocuments({ projectId: project.id });
    const completedTasks = await Task.countDocuments({ projectId: project.id, status: "done" });
    const remainingTasks = totalTasks - completedTasks;
    const totalTimeLoggedAggregation = await Task.aggregate([
      { $match: { projectId: project._id } },
      { $unwind: { path: "$timeLogs", preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, totalHours: { $sum: "$timeLogs.hours" } } },
    ]);

    const totalTimeLogged = totalTimeLoggedAggregation[0]?.totalHours || 0;
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    res.json({
      totalTasks,
      completedTasks,
      remainingTasks,
      progressPercent,
      totalTimeLogged,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const assignedTasks = await Task.find({ assignees: new mongoose.Types.ObjectId(userId) }).lean();

    const totalTasks = assignedTasks.length;
    const completedTasks = assignedTasks.filter((task) => task.status === "done").length;
    const pendingTasks = assignedTasks.filter((task) => task.status !== "done").length;
    const totalTimeLogged = assignedTasks.reduce((sum, task) => {
      const taskHours = (task.timeLogs || []).reduce((innerSum: number, log: any) => innerSum + (log.hours || 0), 0);
      return sum + taskHours;
    }, 0);

    res.json({
      assignedTasks: totalTasks,
      completedTasks,
      pendingTasks,
      totalTimeLogged,
    });
  } catch (error) {
    next(error);
  }
};
