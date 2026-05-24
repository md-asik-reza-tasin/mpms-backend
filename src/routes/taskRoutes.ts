import { Router } from "express";
import {
  addTaskComment,
  addTaskTimeLog,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from "../controllers/taskController";
import { authorize } from "../middleware/role";
import { protect } from "../middleware/auth";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

router.get("/", protect, getTasks);
router.post("/", protect, authorize("Admin", "Manager"), createTask);
router.get("/:id", protect, validateObjectId("id"), getTaskById);
router.put("/:id", protect, authorize("Admin", "Manager"), validateObjectId("id"), updateTask);
router.delete("/:id", protect, authorize("Admin", "Manager"), validateObjectId("id"), deleteTask);
router.patch("/:id/status", protect, validateObjectId("id"), updateTaskStatus);
router.post("/:id/comments", protect, validateObjectId("id"), addTaskComment);
router.post("/:id/time-logs", protect, validateObjectId("id"), addTaskTimeLog);

export default router;
