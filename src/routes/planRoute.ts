import { Router } from "express";
import { createPlan, getPlan, getAllPlans, updatePlan, deletePlan } from "../controllers/planController";
import { validate } from "../middlewares/validate";
import planValidation from "../validators/planValidation";
import { authenticateToken } from "../middlewares/authentication";
import authorize from "../middlewares/authorize";

const planRouter = Router();

// Create a new plan (requires authentication)
planRouter.post("/", authenticateToken, validate(planValidation), authorize("admin"), createPlan);

// Get all plans (optional: you can protect this if needed)
planRouter.get("/", authenticateToken, authorize("user","admin"), getAllPlans);

// Get a single plan by ID (optional: you can protect this if needed)
planRouter.get("/:id", getPlan);

// Update an existing plan by ID (requires authentication)
planRouter.put("/:id", authenticateToken, authorize("user","admin"), validate(planValidation), updatePlan);

// Delete a plan by ID (requires authentication)
planRouter.delete("/:id", authenticateToken, authorize("user","admin"), deletePlan);

export default planRouter;
