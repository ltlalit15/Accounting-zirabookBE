import { Router } from "express";
import { createSalesQuotation, getSalesQuotationById, getSalesQuotationsByCompanyId } from "../controllers/salesorder.controller.js";

const router = Router();

router.post("/quotation", createSalesQuotation);
router.get("/quotation/company/:companyId", getSalesQuotationsByCompanyId);
router.get("/quotation/:id", getSalesQuotationById);

export default router;

    