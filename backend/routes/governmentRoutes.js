import express from 'express';
import {
  getOverview,
  getSchoolsStats,
  getStudentsStats,
  getRatingsStats,
  getPaymentsStats,
  generateStats,
  getSavedStats,
} from '../controllers/governmentController.js';
import { authenticate, requireGovernment } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireGovernment);

// Overview statistics
router.get('/overview', getOverview);

// Schools statistics
router.get('/schools', getSchoolsStats);

// Students statistics
router.get('/students', getStudentsStats);

// Ratings statistics
router.get('/ratings', getRatingsStats);

// Payments statistics
router.get('/payments', getPaymentsStats);

// Generate and save statistics
router.post('/stats/generate', generateStats);

// Get saved statistics
router.get('/stats', getSavedStats);

export default router;
