import { Router } from "express";
import { validate } from "../middlewares/validate";
import { userValidation } from "../validators/userValidation";
import { createUser, loginUser, forgotPassword, resetPassword, logoutUser } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authentication";
import authorize from "../middlewares/authorize";

const authRouter = Router();

// Sign up route
authRouter.post("/signUp", validate(userValidation), createUser);

// Login route
authRouter.post("/login", loginUser);

// Forgot password route
authRouter.post("/forgot-password", forgotPassword);

// Reset password route
authRouter.post("/reset-password", resetPassword);

// Logout route
authRouter.post("/logout", authenticateToken, logoutUser);

export default authRouter;
