import { Router } from "express";
import { createService, getAllServices, getServiceById, getServicesByCompanyId, updateService, deleteService } from "../controllers/service.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

router.post("/", createService);
router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.get("/getServicesByCompanyId/:company_id", getServicesByCompanyId);
router.patch("/:id", updateService);
router.delete("/:id", deleteService);

export default router;

    