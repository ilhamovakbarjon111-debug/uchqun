import { body } from 'express-validator';

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const refreshTokenValidator = [
  // refreshToken is optional - can come from cookie or body
  // Controller will check both cookie and body
  body('refreshToken')
    .optional()
    .isString()
    .withMessage('Refresh token must be a string'),
];


