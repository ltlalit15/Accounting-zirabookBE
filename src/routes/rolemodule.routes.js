import { Router } from "express";
import {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
} from "../controllers/rolemodule.controller.js";

const router = Router();

router.post("/", createPermission);
router.get("/", getAllPermissions);
router.get("/:id", getPermissionById);
router.patch("/:id", updatePermission);
router.delete("/:id", deletePermission);

export default router;
