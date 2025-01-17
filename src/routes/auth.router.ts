import express from "express";
import {
  authGoogle,
  authGoogleCallback,
  login,
  logout,
  register,
  verifiedEmail,
} from "../controllers/auth.controller";

const router = express();

router.post("/auth/google", authGoogle);
router.get("/auth/google/callback", authGoogleCallback);
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.post("/auth/verified-email", verifiedEmail);

export default router;
