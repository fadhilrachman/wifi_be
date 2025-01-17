import express from "express";
import {
  getDataProfile,
  patchDataProfile,
} from "../controllers/profile.controller";
import { protectRoute } from "../../lib/middleware";
const router = express();

router.get("/profile", protectRoute, getDataProfile);
router.patch("/profile", protectRoute, patchDataProfile);
// router.get("/dashboard/user", getDataUser);

export default router;
