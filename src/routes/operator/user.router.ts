import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../../controllers/operator/user.controller";
import {} from "../../lib/middleware";

const router = Router();

router.get("/operator/users", getUsers);
router.post("/operator/users", createUser);

router.get("/operator/users/:id", getUserById);
router.put("/operator/users/:id", updateUser);
router.delete("/operator/users/:id", deleteUser);

export default router;
