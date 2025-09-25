import { Router } from "express";
import {
  createVendor,
  updateVendor,
  getAllVendors,
  getVendorById,
  getVendorsByCompany,
  deleteVendor
} from "../controllers/vendors.controller.js";

const router = Router();

router.post("/", createVendor);
router.get("/", getAllVendors);
router.get("/:id", getVendorById);
router.get("/getVendorsByCompany/:company_id", getVendorsByCompany);
router.patch("/:id", updateVendor);
router.delete("/:id", deleteVendor);

export default router;
