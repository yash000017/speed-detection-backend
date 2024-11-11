import Joi, { ObjectSchema } from 'joi';

// Define the plan validation schema
export const planValidation: ObjectSchema = Joi.object({
  planName: Joi.string()
    .required()
    .messages({
      'string.base': 'Plan name should be a string',
      'any.required': 'Plan name is required',
    }),
  planRate: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Plan rate should be a number',
      'number.positive': 'Plan rate must be a positive number',
      'any.required': 'Plan rate is required',
    }),
  ballCount: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Ball count should be a number',
      'number.integer': 'Ball count should be an integer',
      'number.positive': 'Ball count must be a positive integer',
      'any.required': 'Ball count is required',
    }),
  planDescription: Joi.string()
    .optional()
    .messages({
      'string.base': 'Plan description should be a string',
    }),
});

export default planValidation;
