
import { celebrate, Joi, Segments } from 'celebrate';

export const ticketValidation = celebrate({
  [Segments.BODY]: Joi.object({
    trainUniqueId: Joi.string().required().messages({
      'any.required': 'Train unique ID is required',
      'string.empty': 'Train unique ID cannot be empty',
    }),
    phone: Joi.string()
      .pattern(/^\d{10}$/)
      .required()
      .messages({
        'any.required': 'Phone number is required',
        'string.empty': 'Phone number cannot be empty',
        'string.pattern.base': 'Phone number must be a valid 10-digit number',
      }),
    passengers: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().messages({
            'any.required': 'Passenger name is required',
            'string.empty': 'Passenger name cannot be empty',
          }),
          dob: Joi.string()
            .pattern(/^\d{4}-\d{2}-\d{2}$/)
            .required()
            .messages({
              'any.required': 'Date of birth is required',
              'string.empty': 'Date of birth cannot be empty',
              'string.pattern.base': 'Date of birth must be in YYYY-MM-DD format',
            }),
          gender: Joi.string()
            .valid('male', 'female')
            .required()
            .messages({
              'any.required': 'Gender is required',
              'any.only': 'Gender must be either "male" or "female"',
            }),
          guardian: Joi.alternatives().try(
            Joi.object({
              name: Joi.string().required().messages({
                'any.required': 'Guardian name is required',
                'string.empty': 'Guardian name cannot be empty',
              }),
              dob: Joi.string()
                .pattern(/^\d{4}-\d{2}-\d{2}$/)
                .required()
                .messages({
                  'any.required': 'Guardian date of birth is required',
                  'string.empty': 'Guardian date of birth cannot be empty',
                  'string.pattern.base': 'Guardian date of birth must be in YYYY-MM-DD format',
                }),
              gender: Joi.string()
                .valid('male', 'female')
                .required()
                .messages({
                  'any.required': 'Guardian gender is required',
                  'any.only': 'Guardian gender must be either "male" or "female"',
                }),
            })
          ).optional(),
        })
      )
      .min(1)
      .required()
      .messages({
        'any.required': 'At least one passenger is required',
        'array.min': 'There must be at least one passenger',
      }),
  }),
});

