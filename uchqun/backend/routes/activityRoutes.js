import express from 'express';
import { 
  getActivities, 
  getActivity, 
  createActivity, 
  updateActivity, 
  deleteActivity 
} from '../controllers/activityController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createActivityValidator, updateActivityValidator, activityIdValidator } from '../validators/activityValidator.js';
import { paginationValidator, dateQueryValidator, childIdQueryValidator } from '../validators/queryValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

router.get('/', paginationValidator.concat(dateQueryValidator).concat(childIdQueryValidator), handleValidationErrors, getActivities);
router.get('/:id', activityIdValidator, handleValidationErrors, getActivity);

// CRUD operations (teachers only)
router.post('/', requireRole('teacher', 'admin'), createActivityValidator, handleValidationErrors, createActivity);
router.put('/:id', requireRole('teacher', 'admin'), activityIdValidator.concat(updateActivityValidator), handleValidationErrors, updateActivity);
router.delete('/:id', requireRole('teacher', 'admin'), activityIdValidator, handleValidationErrors, deleteActivity);

export default router;

