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
  getTeachersList,
  getParentsList,
} from '../controllers/governmentController.js';
import { authenticate, requireGovernment } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireGovernment);

// Overview statistics
router.get('/overview', getOverview);

// Schools statistics
router.get('/schools', getSchoolsStats);

// Students list
router.get('/students', getStudentsStats);

// Teachers list
router.get('/teachers', getTeachersList);

// Parents list
router.get('/parents', getParentsList);

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
