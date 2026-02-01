import express from 'express';
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../controllers/groupController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createGroupValidator,
  updateGroupValidator,
  groupIdValidator,
} from '../validators/groupValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { paginationValidator } from '../validators/queryValidator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Read-only routes (for Admin - viewing only)
router.get('/', 
  paginationValidator,
  handleValidationErrors,
  getGroups
);

router.get('/:id', 
  groupIdValidator,
  handleValidationErrors,
  getGroup
);

// Write routes (for Reception - create/edit/delete)
// Admin cannot create/edit/delete groups, only view them
router.post('/', 
  requireRole('reception'), // Only Reception can create groups
  createGroupValidator,
  handleValidationErrors,
  createGroup
);

router.put('/:id', 
  requireRole('reception'), // Only Reception can update groups
  groupIdValidator,
  updateGroupValidator,
  handleValidationErrors,
  updateGroup
);

router.delete('/:id', 
  requireRole('reception'), // Only Reception can delete groups
  groupIdValidator,
  handleValidationErrors,
  deleteGroup
);

export default router;


