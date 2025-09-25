import express from "express";
import { requestPlan, getRequestedPlans, updatePlanRequestStatus, deletePlanRequest } from "../controllers/requestforplan.controller.js";

const router = express.Router();

router.post("/", requestPlan);            // Company requests a plan
router.get("/", getRequestedPlans);       // Admin fetch all requests
router.put("/:id", updatePlanRequestStatus); // Approve/Reject
router.delete("/:id", deletePlanRequest); // Approve/Reject




export default router;
