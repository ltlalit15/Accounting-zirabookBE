import { Router } from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomersByCompany
} from "../controllers/customers.controller.js";

const router = Router();

router.post("/", createCustomer);
router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);

router.get("/getCustomersByCompany/:company_id", getCustomersByCompany);
router.patch("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;




