import express from 'express';
import {
  registerDevice,
  sendNotification,
  getNotifications,
  markAsOpened,
  unregisterDevice,
} from '../controllers/pushNotificationController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Register device token
router.post('/register', registerDevice);

// Send notification (Admin, Reception, Teacher)
router.post('/send', requireRole('admin', 'reception', 'teacher'), sendNotification);

// Get user notifications
router.get('/', getNotifications);

// Mark notification as opened
router.put('/:id/open', markAsOpened);

// Unregister device
router.delete('/device/:token', unregisterDevice);

export default router;
