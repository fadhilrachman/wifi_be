import { Router } from "express";
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../../controllers/superadmin/company.controller";
import {} from "../../lib/middleware";

const router = Router();

router.get("/superadmin/companies", getCompanies);
router.post("/superadmin/companies", createCompany);

router.get("/superadmin/companies/:id", getCompanyById);
router.put("/superadmin/companies/:id", updateCompany);
router.delete("/superadmin/companies/:id", deleteCompany);

export default router;
