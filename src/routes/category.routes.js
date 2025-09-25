import { Router } from "express";
import { createCategory, getAllCategories, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

router.post("/", createCategory);
router.get("/", getAllCategories);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);


export default router;
