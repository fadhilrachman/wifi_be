import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../../controllers/superadmin/user.controller";
import {} from "../../lib/middleware";

const router = Router();

router.get("/superadmin/users", getUsers);
router.post("/superadmin/users", createUser);

router.get("/superadmin/users/:id", getUserById);
router.put("/superadmin/users/:id", updateUser);
router.delete("/superadmin/users/:id", deleteUser);

export default router;
