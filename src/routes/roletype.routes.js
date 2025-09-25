import express from "express";
import {
    createRoleType,
  getAllRoleTypes,
  updateRoleType,
  deleteRoleType
 
} from "../controllers/roletype.controller.js";

const router = express.Router();

router.post("/", createRoleType);
router.get("/", getAllRoleTypes);
router.patch("/:id", updateRoleType);
router.delete("/:id", deleteRoleType);

export default router;

