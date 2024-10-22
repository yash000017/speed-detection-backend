import Joi, { ObjectSchema } from 'joi';

// Define a type for the validation object if needed for clarity.
export const userValidation: ObjectSchema = Joi.object({
  userName: Joi.string()
    .required()
    .messages({
      'string.base': 'User name should be a string',
      'any.required': 'User name is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.base': 'Password should be a string',
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),

  age: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Age should be a number',
      'number.integer': 'Age should be an integer',
      'number.min': 'Age must be greater than or equal to 1',
      'any.required': 'Age is required',
    }),
});
