import { Router } from "express";
import { createUnitDetail, getAllUnitDetails, getUnitDetailById, getUnitDetailsByCompanyId, updateUnitDetail, deleteUnitDetail } from "../controllers/unitdetail.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

 router.post("/", createUnitDetail);
 router.get("/", getAllUnitDetails);
 router.get("/:id", getUnitDetailById);
 router.get("/getUnitDetailsByCompanyId/:company_id", getUnitDetailsByCompanyId);
 router.patch("/:id", updateUnitDetail);
 router.delete("/:id", deleteUnitDetail);

export default router;
