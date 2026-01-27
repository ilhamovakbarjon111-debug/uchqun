import { body, param } from 'express-validator';

export const createAdminValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 100 })
    .withMessage('First name must be at most 100 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 100 })
    .withMessage('Last name must be at most 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]+$/)
    .withMessage('Please provide a valid phone number'),
];

export const updateAdminValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid admin ID'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]+$/)
    .withMessage('Please provide a valid phone number'),
];

export const deleteAdminValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid admin ID'),
];

export const createGovernmentValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 100 })
    .withMessage('First name must be at most 100 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 100 })
    .withMessage('Last name must be at most 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]+$/)
    .withMessage('Please provide a valid phone number'),
];

export const updateGovernmentValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid government account ID'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]+$/)
    .withMessage('Please provide a valid phone number'),
];

export const deleteGovernmentValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid government account ID'),
];
