import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/count', getUnreadCount);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;


