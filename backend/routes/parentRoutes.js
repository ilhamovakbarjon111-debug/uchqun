import express from 'express';
import { authenticate, requireParent, requireAdminOrReception } from '../middleware/auth.js';
import {
  getMyChildren,
  getMyActivities,
  getActivityById,
  getMyMeals,
  getMealById,
  getMyMedia,
  getMediaById,
  getMyProfile,
  getParentData,
  getAIAdvice,
} from '../controllers/parentController.js';

const router = express.Router();

/**
 * Parent Routes
 * 
 * Business Logic:
 * - Parents only see data related to their own account
 * - When viewing the list of parents, clicking on a parent should display:
 *   - Activity
 *   - Meals
 *   - Media
 */

// Parent's own data routes (require Parent authentication)
// AI chat route must come before other routes to avoid conflicts
router.post('/ai/chat', authenticate, requireParent, getAIAdvice);

router.get('/children', authenticate, requireParent, getMyChildren);
router.get('/activities', authenticate, requireParent, getMyActivities);
router.get('/activities/:id', authenticate, requireParent, getActivityById);
router.get('/meals', authenticate, requireParent, getMyMeals);
router.get('/meals/:id', authenticate, requireParent, getMealById);
router.get('/media', authenticate, requireParent, getMyMedia);
router.get('/media/:id', authenticate, requireParent, getMediaById);
router.get('/profile', authenticate, requireParent, getMyProfile);

// View parent data (accessible by Admin or Reception when clicking on parent in list)
// This route must come after all specific routes to avoid conflicts
router.get('/:parentId/data', authenticate, requireAdminOrReception, getParentData);

export default router;


