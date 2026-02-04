import express from 'express';
import {
  getOverview,
  getSchoolsStats,
  getStudentsStats,
  getRatingsStats,
  getSchoolRatings,
  generateStats,
  getSavedStats,
  getAdmins,
  getAdminDetails,
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

// Individual school ratings
router.get('/ratings/:schoolId', getSchoolRatings);

// Generate and save statistics
router.post('/stats/generate', generateStats);

// Get saved statistics
router.get('/stats', getSavedStats);

// Get all admins
router.get('/admins', getAdmins);

// Get admin details with all related data
router.get('/admins/:id', getAdminDetails);

export default router;
