import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { createAdmin, createGovernment, getGovernments, updateGovernmentBySuper, deleteGovernmentBySuper, getAdmins, updateAdminBySuper, deleteAdminBySuper, getAllSchools } from '../controllers/adminController.js';
import { sendMessage, getMessages, getMessageById, replyToMessage, markMessageRead, deleteMessage, getAllPayments } from '../controllers/superAdminController.js';
import { getRegistrationRequests, getRegistrationRequestById, approveRegistrationRequest, rejectRegistrationRequest } from '../controllers/adminRegistrationController.js';
import { passwordResetLimiter } from '../middleware/rateLimiter.js';
import { createAdminValidator, updateAdminValidator, deleteAdminValidator, createGovernmentValidator, updateGovernmentValidator, deleteGovernmentValidator } from '../validators/superAdminValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * Super Admin Routes
 * 
 * Business Logic:
 * - Super Admin can create Admin accounts
 * - Requires authentication (admin role)
 * - Only accessible from Super Admin panel
 */

// Reset super admin password
router.post('/reset-super-admin-password', passwordResetLimiter, async (req, res) => {
    try {
        const { secretKey, newPassword } = req.body;
        
        if (secretKey !== process.env.SUPER_ADMIN_SECRET) {
            return res.status(403).json({ error: 'Invalid secret key' });
        }
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        const admin = await User.findOne({
            where: { email: 'superadmin@uchqun.uz' }
        });
        
        if (!admin) {
            return res.status(404).json({ error: 'Super admin not found' });
        }
        
        // Update password (plain text - hook will hash automatically)
        await admin.update({ password: newPassword });
        
        console.log('✅ Super admin password reset successfully');
        
        res.json({
            success: true,
            message: 'Password reset successfully!',
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check super admin account (dev only)
if (process.env.NODE_ENV !== 'production') {
  router.post('/check-super-admin', async (req, res) => {
    try {
        const { secretKey } = req.body;

        if (secretKey !== process.env.SUPER_ADMIN_SECRET) {
            return res.status(403).json({ error: 'Invalid secret key' });
        }

        const admin = await User.findOne({
            where: { email: 'superadmin@uchqun.uz' }
        });

        if (!admin) {
            return res.json({ exists: false });
        }

        res.json({
            exists: true,
            role: admin.role,
            status: admin.status,
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
  });
}

// Create initial super-admin (protected by secret key, no auth required)
router.post('/create-super-admin', passwordResetLimiter, async (req, res) => {
    try {
        const { secretKey, forceRecreate } = req.body;
        
        // Check secret key (optional in development, required in production)
        const requiredSecret = process.env.SUPER_ADMIN_SECRET || process.env.SUPER_ADMIN_SECRET_KEY;
        const isDevelopment = process.env.NODE_ENV !== 'production';
        
        // In production, require secret key. In development, allow without key if not set
        if (requiredSecret && secretKey !== requiredSecret) {
            return res.status(403).json({ error: 'Invalid secret key' });
        }
        
        // In production, secret key must be provided
        if (!isDevelopment && !secretKey) {
            return res.status(403).json({ error: 'Secret key required in production' });
        }
        
        // Check if super admin exists
        const existing = await User.findOne({
            where: { email: 'superadmin@uchqun.uz' }
        });
        
        if (existing) {
            if (forceRecreate) {
                // Delete and recreate
                await existing.destroy();
                console.log('🗑️ Old super admin deleted, creating new one...');
            } else {
                return res.status(400).json({ 
                    error: 'Super admin already exists',
                    email: existing.email,
                    hint: 'Use forceRecreate: true to recreate'
                });
            }
        }
        
        // Create super admin (using 'admin' role)
        const plainPassword = 'admin123';
        
        // Pass PLAIN password - User model hook will hash it automatically
        const superAdmin = await User.create({
            email: 'superadmin@uchqun.uz',
            password: plainPassword, // Plain text - hook will hash
            firstName: 'Super',
            lastName: 'Admin',
            role: 'admin',
            phone: '+998901234567',
            status: 'active'
        });
        
        res.json({
            success: true,
            message: 'Super admin created successfully! Change password after first login.',
            credentials: {
                email: 'superadmin@uchqun.uz',
            },
        });
    } catch (error) {
        console.error('Create super-admin error:', error);
        res.status(500).json({ error: error.message });
    }
});

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
router.post('/admins', conditionalAuth, createAdminValidator, handleValidationErrors, createAdmin);

// All other routes require Admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Government account management (Super Admin only)
router.get('/government', getGovernments);
router.post('/government', createGovernmentValidator, handleValidationErrors, createGovernment);
router.put('/government/:id', updateGovernmentValidator, handleValidationErrors, updateGovernmentBySuper);
router.delete('/government/:id', deleteGovernmentValidator, handleValidationErrors, deleteGovernmentBySuper);

// List admin accounts (super admin view)
router.get('/admins', getAdmins);
// Update admin account
router.put('/admins/:id', updateAdminValidator, handleValidationErrors, updateAdminBySuper);
// Delete admin account
router.delete('/admins/:id', deleteAdminValidator, handleValidationErrors, deleteAdminBySuper);

// Get all schools with average ratings
router.get('/schools', getAllSchools);

// Get all payments (Super Admin view)
router.get('/payments', getAllPayments);

// Messages to super-admin
router.get('/messages', getMessages);
router.get('/messages/:id', getMessageById);
router.post('/messages/:id/reply', replyToMessage);
router.put('/messages/:id/read', markMessageRead);
router.delete('/messages/:id', deleteMessage);

// Admin registration requests
router.get('/admin-registrations', getRegistrationRequests);
router.get('/admin-registrations/:id', getRegistrationRequestById);
router.post('/admin-registrations/:id/approve', approveRegistrationRequest);
router.post('/admin-registrations/:id/reject', rejectRegistrationRequest);

export default router;

