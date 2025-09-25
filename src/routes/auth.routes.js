import { Router } from "express";
import { companyLogin, myModules } from "../controllers/auth.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

router.post("/company-login", companyLogin);
router.get("/me/modules", authCompany, myModules);

export default router;
