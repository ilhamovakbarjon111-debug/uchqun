import express from 'express';
import { authenticate, requireReception } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  uploadDocument,
  getMyDocuments,
  getVerificationStatus,
  createTeacher,
  createParent,
  getTeachers,
  getParents,
  updateTeacher,
  updateParent,
  deleteTeacher,
  deleteParent,
  createChildForParent,
  getTeacherRatings,
} from '../controllers/receptionController.js';
import { getGroups } from '../controllers/groupController.js';
import { sendMessage } from '../controllers/superAdminController.js';

const router = express.Router();

/**
 * Reception Routes
 * 
 * Business Logic:
 * - Reception provides login credentials (email & password) to Teachers and Parents
 * - Reception cannot access Activity, Meals, Media, News, or Children modules
 * - Reception must upload required documents after installation
 * - Documents are visible to Admin for review
 */

// All routes require Reception authentication
router.use(authenticate);
router.use(requireReception);

// Document management (for Reception's own documents)
router.post('/documents', upload.single('file'), uploadDocument);
router.get('/documents', getMyDocuments);
router.get('/verification-status', getVerificationStatus);

// Teacher management
router.post('/teachers', createTeacher);
router.get('/teachers', getTeachers);
router.get('/teachers/:id/ratings', getTeacherRatings);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Parent management (with file upload support for child photo)
router.post('/parents', upload.fields([{ name: 'child[photo]', maxCount: 1 }]), createParent);
router.get('/parents', getParents);
router.put('/parents/:id', updateParent);
router.delete('/parents/:id', deleteParent);
// Add child to existing parent (separate endpoint to avoid route conflicts)
router.post('/children', upload.fields([{ name: 'child[photo]', maxCount: 1 }]), createChildForParent);

// Groups (for parent assignment)
router.get('/groups', getGroups);

// Send message to super-admin
router.post('/message-to-super-admin', sendMessage);

export default router;


