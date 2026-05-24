import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from "../controllers/projectController";
import { authorize } from "../middleware/role";
import { protect } from "../middleware/auth";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

router.get("/", protect, getProjects);
router.post("/", protect, authorize("Admin", "Manager"), createProject);
router.get("/:id", protect, validateObjectId("id"), getProjectById);
router.put("/:id", protect, authorize("Admin", "Manager"), validateObjectId("id"), updateProject);
router.delete("/:id", protect, authorize("Admin", "Manager"), validateObjectId("id"), deleteProject);

export default router;
