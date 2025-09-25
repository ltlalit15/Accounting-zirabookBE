import express from "express";
import {
    createAdminUser,
getAllAdminUsers,
getAdminUserById,
updateAdminUser,
deleteAdminUser,
login
 
} from "../controllers/adminuser.controller.js";

const router = express.Router();

router.post("/", createAdminUser);
router.get("/", getAllAdminUsers);
router.get("/:id", getAdminUserById);
router.patch("/:id", updateAdminUser);
router.delete("/:id", deleteAdminUser);
router.post("/login", login);

export default router;

