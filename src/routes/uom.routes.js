import { Router } from "express";
import { createUOM, getAllUOMs  } from "../controllers/uom.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

router.post("/", createUOM);
router.get("/", getAllUOMs);
// router.get("/:id", getWarehouseById);
// router.patch("/:id", updateWarehouse);
// router.delete("/:id", deleteWarehouse);

export default router;
