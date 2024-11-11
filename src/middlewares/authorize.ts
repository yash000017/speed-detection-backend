// src/middlewares/authorize.ts
import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequestAuth } from "../types/express";

const authorize = (...allowedRoles: string[]): RequestHandler => {
  return (req: CustomRequestAuth, res: Response, next: NextFunction): void => {
    const user = req.user; // Ensure req.user is populated by authentication middleware
    console.log("user1",user)
    if (user && allowedRoles.includes(user.role)) {
      return next(); // User is authorized
    }

    // If user is not authorized
    res.status(403).json({
      status: "false",
      message: "Access denied. You do not have permission to access this resource.",
    });
  };
};

export default authorize;
