import { body, param } from 'express-validator';
import { isUUID } from '../utils/uuidValidator.js';

export const createGroupValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ max: 255 })
    .withMessage('Group name must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be less than 5000 characters'),
  body('teacherId')
    .notEmpty()
    .withMessage('Teacher ID is required')
    .custom(value => {
      if (!isUUID(value)) {
        throw new Error('Teacher ID must be a valid UUID');
      }
      return true;
    }),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),
  body('ageRange')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Age range must be less than 50 characters'),
];

export const updateGroupValidator = [
  param('id')
    .custom(value => {
      if (!isUUID(value)) {
        throw new Error('Group ID must be a valid UUID');
      }
      return true;
    }),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Group name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Group name must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be less than 5000 characters'),
  body('teacherId')
    .optional()
    .custom(value => {
      if (!isUUID(value)) {
        throw new Error('Teacher ID must be a valid UUID');
      }
      return true;
    }),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),
  body('ageRange')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Age range must be less than 50 characters'),
];

export const groupIdValidator = [
  param('id')
    .custom(value => {
      if (!isUUID(value)) {
        throw new Error('Group ID must be a valid UUID');
      }
      return true;
    }),
];



