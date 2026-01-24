import express from 'express';
import {
  analyzeRatings,
  getWarnings,
  resolveWarning,
  notifyUsers,
} from '../controllers/aiWarningController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Analyze ratings and generate warnings (Admin, Government)
router.post('/analyze', requireRole('admin', 'government'), analyzeRatings);

// Get warnings
router.get('/', getWarnings);

// Resolve warning (Admin, Government)
router.put('/:id/resolve', requireRole('admin', 'government'), resolveWarning);

// Notify users about warning (Admin, Government)
router.post('/:id/notify', requireRole('admin', 'government'), notifyUsers);

export default router;
