import express from "express";
import { createTransfer, getAllTransfers, getTransfersByCompanyId } from "../controllers/stocktransfer.controller.js";

const router = express.Router();

// Create a new transfer
router.post("/", createTransfer);

// // Get all transfers (summary list)
router.get("/", getAllTransfers);

router.get("/company/:companyId", getTransfersByCompanyId);


// // Get transfer by ID (with items + warehouses)
// router.get("/:id", getTransferById);

export default router;
