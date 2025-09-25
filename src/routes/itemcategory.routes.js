import { Router } from "express";
import { createItemCategory, getAllCategoryItem } from "../controllers/itemcategory.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

router.post("/", createItemCategory);
router.get("/", getAllCategoryItem);
// router.patch("/:id", updateCategory);
// router.delete("/:id", deleteCategory);


export default router;
