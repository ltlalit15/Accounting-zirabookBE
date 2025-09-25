import { Router } from "express";
import {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionByCompany
 
} from "../controllers/transaction.controller.js";

const router = Router();

router.post("/", createTransaction);
router.get("/", getAllTransactions);
router.get("/:id", getTransactionById);
router.get("/getTransactionByCompany/:company_id", getTransactionByCompany);
router.patch("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);


export default router;
