import Joi, { ObjectSchema } from 'joi';

// Define the payment validation schema
export const paymentValidation: ObjectSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'string.base': 'User ID should be a string',
      'any.required': 'User ID is required',
    }),
  planId: Joi.string()
    .required()
    .messages({
      'string.base': 'Plan ID should be a string',
      'any.required': 'Plan ID is required',
    }),
  paymentAmount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Payment amount should be a number',
      'number.positive': 'Payment amount must be a positive number',
      'any.required': 'Payment amount is required',
    }),
  razorpay_order_id: Joi.string()
    .optional()
    .messages({
      'string.base': 'Razorpay order ID should be a string',
    }),
  razorpay_paymentGatewayId: Joi.string()
    .optional()
    .messages({
      'string.base': 'Razorpay payment gateway ID should be a string',
    }),
  razorpay_signature: Joi.string()
    .optional()
    .messages({
      'string.base': 'Razorpay signature should be a string',
    }),
  isActive: Joi.boolean() // Change to boolean for active/inactive status
    .required()
    .messages({
      'boolean.base': 'Active status should be a boolean value (true or false)',
      'any.required': 'Active status is required',
    }),
});

export default paymentValidation;
