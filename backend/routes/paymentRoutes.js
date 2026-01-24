import express from 'express';
import {
  createPayment,
  getPayments,
  getPayment,
  paymentCallback,
  refundPayment,
} from '../controllers/paymentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Payment callback (public, but should be secured with webhook secret)
router.post('/callback', paymentCallback);

router.use(authenticate);

// Create payment (Parent, Admin)
router.post('/', requireRole('parent', 'admin'), createPayment);

// Get payments
router.get('/', getPayments);

// Get payment by ID
router.get('/:id', getPayment);

// Refund payment (Admin)
router.post('/:id/refund', requireRole('admin'), refundPayment);

export default router;
