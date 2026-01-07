import express from 'express';
import { 
  getMedia, 
  getMediaItem, 
  createMedia, 
  uploadMedia,
  updateMedia, 
  deleteMedia 
} from '../controllers/mediaController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createMediaValidator, updateMediaValidator, mediaIdValidator } from '../validators/mediaValidator.js';
import { paginationValidator, dateQueryValidator, childIdQueryValidator } from '../validators/queryValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { body } from 'express-validator';

const router = express.Router();

router.use(authenticate);

router.get('/', paginationValidator.concat(dateQueryValidator).concat(childIdQueryValidator), handleValidationErrors, getMedia);
router.get('/:id', mediaIdValidator, handleValidationErrors, getMediaItem);

// File upload endpoint (multipart/form-data)
router.post('/upload', 
  requireRole('teacher', 'admin'), 
  uploadSingle,
  [
    body('childId')
      .notEmpty()
      .withMessage('Child ID is required'),
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
      .withMessage('Date must be in YYYY-MM-DD format'),
    body('activityId')
      .optional(),
  ],
  handleValidationErrors,
  handleUploadError,
  uploadMedia
);

// URL-based media creation (legacy support)
router.post('/', requireRole('teacher', 'admin'), createMediaValidator, handleValidationErrors, createMedia);
router.put('/:id', requireRole('teacher', 'admin'), mediaIdValidator.concat(updateMediaValidator), handleValidationErrors, updateMedia);
router.delete('/:id', requireRole('teacher', 'admin'), mediaIdValidator, handleValidationErrors, deleteMedia);

export default router;

