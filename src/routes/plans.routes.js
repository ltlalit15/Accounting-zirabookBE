import { Router } from "express";
import { createPlan, getPlans, getPlanWithModules,deletePlan,getPlanById ,updatePlan} from "../controllers/plans.controller.js";
const router = Router();

router.post("/", createPlan);        // create plan with modules[]
router.get("/", getPlans);           // list plans
router.get("/getPlanWithModules/:id", getPlanWithModules); // plan + modules
router.get("/:id", getPlanById); // plan + modules
router.delete("/:id", deletePlan); // plan + modules
router.put("/:id", updatePlan); // plan + modules







export default router;
