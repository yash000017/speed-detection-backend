import { Router } from "express";
import { getUser, getAllUsers, deleteUser } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authentication";
import authorize from "../middlewares/authorize";

const userRouter = Router();

userRouter.get("/:id", authenticateToken, getUser);
userRouter.get("/", authenticateToken, authorize("admin"), getAllUsers);
userRouter.delete("/:id", authenticateToken, authorize("admin"), deleteUser);

export default userRouter;
