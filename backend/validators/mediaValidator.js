import { body, param } from 'express-validator';

// UUID validation regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUUID = (value) => {
  return typeof value === 'string' && UUID_REGEX.test(value);
};

export const createMediaValidator = [
  body('childId')
    .notEmpty()
    .withMessage('Child ID is required')
    .custom((value) => {
      if (!isUUID(value)) {
        throw new Error('Child ID must be a valid UUID');
      }
      return true;
    }),
  body('activityId')
    .optional()
    .custom((value) => {
      if (value && !isUUID(value)) {
        throw new Error('Activity ID must be a valid UUID');
      }
      return true;
    }),
  body('type')
    .notEmpty()
    .withMessage('Media type is required')
    .isIn(['photo', 'video'])
    .withMessage('Media type must be photo or video'),
  body('url')
    .trim()
    .notEmpty()
    .withMessage('Media URL is required')
    .isURL()
    .withMessage('Media URL must be a valid URL'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or less'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      if (value) {
        const mediaDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (mediaDate > today) {
          throw new Error('Media date cannot be in the future');
        }
      }
      return true;
    }),
];

export const updateMediaValidator = [
  ...createMediaValidator.map((validator) => validator.optional()),
  body('childId').optional(),
];

export const mediaIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Media ID is required')
    .custom((value) => {
      if (!isUUID(value)) {
        throw new Error('Media ID must be a valid UUID');
      }
      return true;
    }),
];

