import { body, param } from 'express-validator';

// UUID validation regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUUID = (value) => {
  return typeof value === 'string' && UUID_REGEX.test(value);
};

export const createMealValidator = [
  body('childId')
    .notEmpty()
    .withMessage('Child ID is required')
    .custom((value) => {
      if (!isUUID(value)) {
        throw new Error('Child ID must be a valid UUID');
      }
      return true;
    }),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      if (value) {
        const mealDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (mealDate > today) {
          throw new Error('Meal date cannot be in the future');
        }
      }
      return true;
    }),
  body('mealType')
    .notEmpty()
    .withMessage('Meal type is required')
    .isIn(['Breakfast', 'Lunch', 'Snack', 'Dinner'])
    .withMessage('Meal type must be Breakfast, Lunch, Snack, or Dinner'),
  body('mealName')
    .trim()
    .notEmpty()
    .withMessage('Meal name is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Meal name must be between 1 and 500 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or less'),
  body('quantity')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Quantity must be 255 characters or less'),
  body('specialNotes')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Special notes must be 5000 characters or less'),
  body('time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:mm format (24-hour)'),
  body('eaten')
    .optional()
    .isBoolean()
    .withMessage('Eaten must be a boolean value'),
];

export const updateMealValidator = [
  ...createMealValidator.map((validator) => validator.optional()),
  body('childId').optional(),
];

export const mealIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Meal ID is required')
    .custom((value) => {
      if (!isUUID(value)) {
        throw new Error('Meal ID must be a valid UUID');
      }
      return true;
    }),
];

