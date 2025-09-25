import { Router } from "express";
import { createAdjustment, deleteAdjustment, getAdjustmentById, getAdjustmentsByCompanyId, getAllAdjustments, updateAdjustment } from "../controllers/inventoryAdjustment.controller.js";

const router = Router();


router.post("/", createAdjustment );
router.get("/", getAllAdjustments );
router.get("/:id", getAdjustmentById);

            // Get by ID
router.get("/company/:companyId", getAdjustmentsByCompanyId); // Get by Company
router.patch("/:id", updateAdjustment);                  // Edit
router.delete("/:id", deleteAdjustment);  


export default router;










