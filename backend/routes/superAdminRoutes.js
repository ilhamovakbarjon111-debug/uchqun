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

// Create initial super-admin (protected by secret key, no auth required)
router.post('/create-super-admin', async (req, res) => {
    try {
        const { secretKey } = req.body;
        
        // Check secret key
        if (secretKey !== process.env.SUPER_ADMIN_SECRET) {
            return res.status(403).json({ error: 'Invalid secret key' });
        }
        
        const bcrypt = (await import('bcrypt')).default;
        const User = (await import('../models/User.js')).default;
        
        // Check if super admin exists
        const existing = await User.findOne({
            where: { email: 'superadmin@uchqun.uz' }
        });
        
        if (existing) {
            return res.status(400).json({ 
                error: 'Super admin already exists',
                email: existing.email 
            });
        }
        
        // Create super admin
        const hashedPassword = await bcrypt.hash('SuperAdmin@2026', 10);
        const superAdmin = await User.create({
            email: 'superadmin@uchqun.uz',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'super_admin',
            phone: '+998901234567',
            status: 'active'
        });
        
        res.json({
            success: true,
            message: 'Super admin created successfully!',
            credentials: {
                email: 'superadmin@uchqun.uz',
                password: 'SuperAdmin@2026'
            },
            warning: 'IMPORTANT: Change password after first login!'
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

