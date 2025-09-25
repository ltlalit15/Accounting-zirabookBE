import { Router } from "express";
import { createSubgroup, getAllSubgroups, getSubgroupById, updateSubgroup, deleteSubgroup } from "../controllers/subgroup.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

router.post("/", createSubgroup);
router.get("/", getAllSubgroups);
router.get("/:id", getSubgroupById);
router.patch("/:id", updateSubgroup);
router.delete("/:id", deleteSubgroup);


export default router;
