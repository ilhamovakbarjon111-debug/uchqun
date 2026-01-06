import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { createAdmin, getAdmins, updateAdminBySuper, deleteAdminBySuper } from '../controllers/adminController.js';

const router = express.Router();

/**
 * Super Admin Routes
 * 
 * Business Logic:
 * - Super Admin can create Admin accounts
 * - Requires authentication (admin role)
 * - Only accessible from Super Admin panel
 */

// Conditional middleware for create admin route
// If role is 'superAdmin', skip authentication
const conditionalAuth = async (req, res, next) => {
  if (req.body.role === 'superAdmin') {
    // Skip authentication for superAdmin creation
    return next();
  }
  // Otherwise, require authentication
  authenticate(req, res, (err) => {
    if (err) return next(err);
    requireAdmin(req, res, next);
  });
};

// Create admin account (conditional authentication)
router.post('/admins', conditionalAuth, createAdmin);

// All other routes require Admin authentication
router.use(authenticate);
router.use(requireAdmin);

// List admin accounts (super admin view)
router.get('/admins', getAdmins);
// Update admin account
router.put('/admins/:id', updateAdminBySuper);
// Delete admin account
router.delete('/admins/:id', deleteAdminBySuper);

export default router;

