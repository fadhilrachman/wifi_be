import { Router } from "express";
import { loginSuperadmin, meSuperadmin } from "../../controllers/superadmin/auth.controller";

const router = Router();

router.post("/superadmin/auth/login", loginSuperadmin);
router.get("/superadmin/auth/me", meSuperadmin);

export default router;

