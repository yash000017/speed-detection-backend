import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomRequestAuth } from "../types/express";
import User from "../models/userModel"; // Import the User model

const JWT_SECRET = process.env.JWT_SECRET;

interface JwtPayload {
  userId: string;
}

export const authenticateToken = async (
  req: CustomRequestAuth,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Check if the token is provided
  if (!token) {
    res.status(401).json({
      status: "false",
      message: "Access denied. No token provided.",
    });
    return;
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Check if the decoded payload contains userId
    if (!decoded.userId) {
      res.status(400).json({
        status: "false",
        message: "Invalid token payload. User ID is missing.",
      });
      return;
    }

    // Find the user by userId
    const user = await User.findOne({ where: { userId: decoded.userId } });
    // If user not found in the database
    if (!user) {
      res.status(404).json({
        status: "false",
        message: "User not found. The token might be invalid.",
      });
      return;
    }
    
    // Check if the current token matches the token stored in the database
    if (user.currentToken !== token) {
      res.status(401).json({
        status: "false",
        message: "Token mismatch. Please log in again.",
      });
      return;
    }
    
    // Attach user data to the request for further processing in the next middleware
    req.user = {
      userId: user.userId,
      role: user.role,
    };
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error verifying token:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        status: "false",
        message: "Invalid token format or signature.",
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: "false",
        message: "Token has expired. Please log in again.",
      });
      return;
    }

    res.status(500).json({
      status: "false",
      message: "An error occurred while processing the token.",
    });
  }
};
