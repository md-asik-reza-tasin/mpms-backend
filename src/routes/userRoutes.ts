import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/userController";
import { authorize } from "../middleware/role";
import { protect } from "../middleware/auth";
import { validateObjectId } from "../middleware/validateObjectId";

const router = Router();

router.use(protect, authorize("Admin", "Manager"));

router.get("/", getUsers);
router.post("/", createUser);
router.get("/:id", validateObjectId("id"), getUserById);
router.put("/:id", validateObjectId("id"), updateUser);
router.delete("/:id", validateObjectId("id"), deleteUser);

export default router;
