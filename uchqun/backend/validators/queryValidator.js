import { query } from 'express-validator';

// UUID validation regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUUID = (value) => {
  return typeof value === 'string' && UUID_REGEX.test(value);
};

export const paginationValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a number between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative number'),
];

export const dateQueryValidator = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format'),
];

export const childIdQueryValidator = [
  query('childId')
    .optional()
    .custom((value) => {
      if (value && !isUUID(value)) {
        throw new Error('Child ID must be a valid UUID');
      }
      return true;
    }),
];

