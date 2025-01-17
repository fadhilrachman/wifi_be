import express from "express";
import {
  getDataDashboard,
  getDataUser,
} from "../controllers/dashboard.controller";
import { protectRoute } from "../../lib/middleware";
const router = express();

router.get("/dashboard", protectRoute, getDataDashboard);
router.get("/dashboard/user", protectRoute, getDataUser);

export default router;
