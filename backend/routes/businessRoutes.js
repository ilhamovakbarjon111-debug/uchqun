import express from 'express';
import {
  getOverview,
  getUsersStats,
  getRevenueStats,
  getUsageStats,
  generateStats,
  getSavedStats,
} from '../controllers/businessController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

// Overview statistics
router.get('/overview', getOverview);

// Users statistics
router.get('/users', getUsersStats);

// Revenue statistics
router.get('/revenue', getRevenueStats);

// Usage statistics
router.get('/usage', getUsageStats);

// Generate and save statistics
router.post('/stats/generate', generateStats);

// Get saved statistics
router.get('/stats', getSavedStats);

export default router;
