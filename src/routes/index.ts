import { Router } from "express";
import usersRouter from "./userRoute";
import authRouter from "./authRoute";
import planRouter from "./planRoute";

const router = Router()

router.use("/users", usersRouter)
router.use("/", authRouter)
router.use("/plans", planRouter)

export default router