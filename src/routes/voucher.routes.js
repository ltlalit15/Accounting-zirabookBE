import { Router } from "express";
import { createVoucher, getAllVouchers, getVoucherById, getVouchersByCompanyId, updateVoucher, deleteVoucher } from "../controllers/voucher.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

router.post("/", createVoucher);
router.get("/", getAllVouchers);
router.get("/:id", getVoucherById);
router.get("/getVouchersByCompanyId/:company_id", getVouchersByCompanyId);
router.patch("/:id", updateVoucher);
router.delete("/:id", deleteVoucher);

export default router;
