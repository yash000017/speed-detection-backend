import { Router } from "express";
import usersRouter from "./userRoute";
import authRouter from "./authRoute";
import planRouter from "./planRoute";
import paymentRouter from "./userPlanRoute";
import dashboardRouter from "./dashboardRoute";

const router = Router()

router.use("/users", usersRouter)
router.use("/", authRouter)
router.use("/plans", planRouter)
router.use("/user-plan", paymentRouter)
router.use("/dashboard",dashboardRouter)

export default router