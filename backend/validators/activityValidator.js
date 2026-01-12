import { body, param } from 'express-validator';

// UUID validation regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUUID = (value) => {
  return typeof value === 'string' && UUID_REGEX.test(value);
};

export const createActivityValidator = [
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
        const activityDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        if (activityDate > today) {
          throw new Error('Activity date cannot be in the future');
        }
      }
      return true;
    }),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or less'),
  body('type')
    .notEmpty()
    .withMessage('Activity type is required')
    .isIn(['Learning', 'Therapy', 'Social', 'Physical', 'Other'])
    .withMessage('Activity type must be Learning, Therapy, Social, Physical, or Other'),
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 0, max: 1440 })
    .withMessage('Duration must be a number between 0 and 1440 minutes (24 hours)'),
  body('teacher')
    .trim()
    .notEmpty()
    .withMessage('Teacher name is required')
    .isLength({ max: 255 })
    .withMessage('Teacher name must be 255 characters or less'),
  body('studentEngagement')
    .optional()
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Student engagement must be High, Medium, or Low'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Notes must be 5000 characters or less'),
  // Individual Plan fields
  body('skill')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Skill must be 500 characters or less'),
  body('goal')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Goal must be 5000 characters or less'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && req.body.startDate) {
        const start = new Date(req.body.startDate);
        const end = new Date(value);
        if (end < start) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  body('tasks')
    .optional()
    .isArray()
    .withMessage('Tasks must be an array'),
  body('tasks.*')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Each task must be 1000 characters or less'),
  body('methods')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Methods must be 5000 characters or less'),
  body('progress')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Progress must be 5000 characters or less'),
  body('observation')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Observation must be 5000 characters or less'),
];

export const updateActivityValidator = [
  ...createActivityValidator.map((validator) => validator.optional()),
  body('childId').optional(),
];

export const activityIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Activity ID is required')
    .custom((value) => {
      if (!isUUID(value)) {
        throw new Error('Activity ID must be a valid UUID');
      }
      return true;
    }),
];

