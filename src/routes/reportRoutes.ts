import { Router } from "express";
import { getProjectReport, getUserReport } from "../controllers/reportController";
import { protect } from "../middleware/auth";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

router.get("/project/:projectId", protect, validateObjectId("projectId"), getProjectReport);
router.get("/user/:userId", protect, validateObjectId("userId"), getUserReport);

export default router;
