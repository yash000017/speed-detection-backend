import Joi, { ObjectSchema } from 'joi';

// Define a type for the validation object if needed for clarity.
export const userValidation: ObjectSchema = Joi.object({
  userName: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.base': 'User name should be a string',
      'string.empty': 'User name cannot be empty',
      'string.min': 'User name should be at least 3 characters long',
      'string.max': 'User name should not exceed 50 characters',
      'any.required': 'User name is required',
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } }) // Set to false to accept emails without specific TLDs
    .required()
    .messages({
      'string.base': 'Email should be a string',
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .max(20)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.base': 'Password should be a string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password should not exceed 20 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@, $, !, %, *, ?, &)',
      'any.required': 'Password is required',
    }),

  age: Joi.number()
    .integer()
    .min(1)
    .max(120)
    .required()
    .messages({
      'number.base': 'Age should be a number',
      'number.integer': 'Age should be an integer',
      'number.min': 'Age must be at least 1',
      'number.max': 'Age cannot exceed 120',
      'any.required': 'Age is required',
    }),
});
