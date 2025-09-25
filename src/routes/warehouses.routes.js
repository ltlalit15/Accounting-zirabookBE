import { Router } from "express";
import { createWarehouse, getAllWarehouses, getWarehouseById, updateWarehouse, deleteWarehouse  } from "../controllers/warehouses.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

router.post("/", createWarehouse);
router.get("/", getAllWarehouses);
router.get("/:id", getWarehouseById);
router.patch("/:id", updateWarehouse);
router.delete("/:id", deleteWarehouse);

export default router;
