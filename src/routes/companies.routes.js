import { Router } from "express";
import { createCompany, getCompanies, getCompanyModules, updateCompanyPlan, deleteCompany } from "../controllers/companies.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

router.post("/", createCompany);                 // super admin creates company
router.get("/", getCompanies);                   // list companies
router.get("/:id/modules", getCompanyModules);   // modules by company id (for admin)
router.put("/:id/plan", updateCompanyPlan);   
router.delete("/:id", deleteCompany);// change company's plan

// Company self: get own modules (via JWT)
router.get("/me/modules", authCompany, (req, res) => res.redirect(307, "/api/auth/me/modules"));

export default router;
