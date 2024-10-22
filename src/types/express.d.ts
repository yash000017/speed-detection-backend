import { Request } from "express";

// Extend the Request interface to include the 'user' property
export interface CustomRequest extends Request {
  user?: string; // Assuming userId is a string
}

export interface CustomRequestAuth extends Request {
  user?: {
    userId: string;
    role: string;
  };
}