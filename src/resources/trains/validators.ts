import { celebrate, Joi, Segments } from 'celebrate';

export const trainValidation = celebrate({
  [Segments.BODY]: Joi.object({
    trainNo: Joi.string().required().messages({
      'any.required': 'Train number is required',
      'string.empty': 'Train number cannot be empty',
    }),
    source: Joi.string().required().messages({
      'any.required': 'Source is required',
      'string.empty': 'Source cannot be empty',
    }),
    destination: Joi.string().required().messages({
      'any.required': 'Destination is required',
      'string.empty': 'Destination cannot be empty',
    }),
    sourceTime: Joi.string().isoDate().required().messages({
      'any.required': 'Source time is required',
      'string.empty': 'Source time cannot be empty',
      'string.isoDate': 'Source time must be a valid ISO date-time string',
    }),
    destinationTime: Joi.string().isoDate().required().messages({
      'any.required': 'Destination time is required',
      'string.empty': 'Destination time cannot be empty',
      'string.isoDate': 'Destination time must be a valid ISO date-time string',
    }),
  }),
});
