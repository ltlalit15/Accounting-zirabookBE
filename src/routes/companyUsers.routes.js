import express from "express";
import {
  createCompanyUser,
  getAllCompanyUsers,
  getCompanyUserById,
  updateCompanyUser,
  deleteCompanyUser,
  getCompanyUsersByCompanyId
} from "../controllers/companyUsers.controller.js";

const router = express.Router();

// CRUD Routes
router.post("/", createCompanyUser);        // Create
router.get("/", getAllCompanyUsers);        // Read All
router.get("/:id", getCompanyUserById);     // Read One
router.put("/:id", updateCompanyUser);      // Update
router.delete("/:id", deleteCompanyUser);   // Delete

router.get("/getCompanyUsersByCompanyId/:company_id", getCompanyUsersByCompanyId);

export default router;
