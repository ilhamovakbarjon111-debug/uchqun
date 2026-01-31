import { body, param } from 'express-validator';
import { isUUID } from '../utils/uuidValidator.js';

export const createNewsValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 500 })
    .withMessage('Title must be less than 500 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 10000 })
    .withMessage('Content must be less than 10000 characters'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
  body('targetAudience')
    .optional()
    .isIn(['all', 'parents', 'teachers', 'admins'])
    .withMessage('Target audience must be one of: all, parents, teachers, admins'),
];

export const updateNewsValidator = [
  param('id')
    .custom(value => {
      if (!isUUID(value)) {
        throw new Error('News ID must be a valid UUID');
      }
      return true;
    }),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Title must be less than 500 characters'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty')
    .isLength({ max: 10000 })
    .withMessage('Content must be less than 10000 characters'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
  body('targetAudience')
    .optional()
    .isIn(['all', 'parents', 'teachers', 'admins'])
    .withMessage('Target audience must be one of: all, parents, teachers, admins'),
];

export const newsIdValidator = [
  param('id')
    .custom(value => {
      if (!isUUID(value)) {
        throw new Error('News ID must be a valid UUID');
      }
      return true;
    }),
];



