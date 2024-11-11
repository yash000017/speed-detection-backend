import { Router } from "express";
import { getDashboardData } from "../controllers/dashboardController";
import { authenticateToken } from "../middlewares/authentication";
import authorize from "../middlewares/authorize";

const dashboardRouter = Router();

// Define route for fetching dashboard data, accessible by authenticated users
dashboardRouter.get("/data", authenticateToken,authorize("admin"), getDashboardData);

// Define route for fetching user stats, accessible only to users with "admin" role
// dashboardRouter.get("/user-stats", authenticateToken, authorize("admin"), getUserStats);

// Define route for deleting a dashboard record, accessible only to users with "admin" role
// dashboardRouter.delete("/record/:id", authenticateToken, authorize("admin"), deleteDashboardRecord);

export default dashboardRouter;
