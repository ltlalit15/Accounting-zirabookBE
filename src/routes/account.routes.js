import { Router } from "express";
import { createAccount,  getAllAccounts, getAccountById, updateAccount, deleteAccount, getAccountByCompany } from "../controllers/account.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

router.post("/", createAccount);
router.get("/", getAllAccounts);
router.get("/:id", getAccountById);
router.patch("/:id", updateAccount);
router.delete("/:id", deleteAccount);
router.get("/getAccountByCompany/:company_id", getAccountByCompany);



export default router;
