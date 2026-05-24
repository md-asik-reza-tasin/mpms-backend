import { Router } from "express";
import {
  createSprint,
  deleteSprint,
  getSprintById,
  getSprintsByProject,
  updateSprint,
} from "../controllers/sprintController";
import { authorize } from "../middleware/role";
import { protect } from "../middleware/auth";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

router.get("/projects/:projectId/sprints", protect, validateObjectId("projectId"), getSprintsByProject);
router.post(
  "/projects/:projectId/sprints",
  protect,
  authorize("Admin", "Manager"),
  validateObjectId("projectId"),
  createSprint
);
router.get("/sprints/:id", protect, validateObjectId("id"), getSprintById);
router.put("/sprints/:id", protect, authorize("Admin", "Manager"), validateObjectId("id"), updateSprint);
router.delete("/sprints/:id", protect, authorize("Admin", "Manager"), validateObjectId("id"), deleteSprint);

export default router;
