import { Router } from "express";
import { createProduct, getAllProducts, getProductById, getProductsByCompanyId, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { authCompany } from "../middleware/authCompany.js";

const router = Router();

router.post("/", createProduct);
    router.get("/", getAllProducts);
    router.get("/:id", getProductById);
    router.get("/getProductsByCompanyId/:company_id", getProductsByCompanyId);
    router.patch("/:id", updateProduct);
    router.delete("/:id", deleteProduct);

export default router;
