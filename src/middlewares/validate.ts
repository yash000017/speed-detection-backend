import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// This middleware function will validate request data using the provided schema.
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      // Map through the error details to extract error messages
      const errors = error.details.map((detail) => detail.message);
      
      // Send a 400 response with the error messages and return to stop execution
      res.status(400).json({ errors });
    } else {
      // If validation passes, call the next middleware
      next();
    }
  };
};
