import express from 'express';
import {
  getTherapies,
  getTherapy,
  createTherapy,
  updateTherapy,
  deleteTherapy,
  startTherapy,
  endTherapy,
  getTherapyUsage,
} from '../controllers/therapyController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getTherapies);
router.get('/:id', getTherapy);

// Protected routes
router.use(authenticate);

// Create therapy (Admin, Teacher)
router.post('/', requireRole('admin', 'teacher'), createTherapy);

// Update therapy (Admin, Teacher)
router.put('/:id', requireRole('admin', 'teacher'), updateTherapy);

// Delete therapy (Admin, Teacher)
router.delete('/:id', requireRole('admin', 'teacher'), deleteTherapy);

// Start therapy session (Parent, Teacher)
router.post('/:id/start', requireRole('parent', 'teacher'), startTherapy);

// End therapy session (Parent, Teacher)
router.put('/usage/:id/end', requireRole('parent', 'teacher'), endTherapy);

// Get therapy usage history
router.get('/usage', getTherapyUsage);

export default router;
