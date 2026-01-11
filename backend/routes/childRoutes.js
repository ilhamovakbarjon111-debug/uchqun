import express from 'express';
import { getChildren, getChild, updateChild } from '../controllers/childController.js';
import { authenticate } from '../middleware/auth.js';
import { updateChildValidator, childIdValidator } from '../validators/childValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { uploadChildPhoto } from '../middleware/uploadChildren.js'; // ✅ To'g'ri yo'l

const router = express.Router();

// Public debug endpoint (no auth required) - MUST be before authenticate middleware
router.get('/debug/appwrite', (req, res) => {
    const appwriteConfigured = Boolean(
        process.env.APPWRITE_ENDPOINT &&
        process.env.APPWRITE_PROJECT_ID &&
        process.env.APPWRITE_API_KEY &&
        process.env.APPWRITE_BUCKET_ID
    );
    
    res.json({
        appwriteConfigured,
        endpoint: process.env.APPWRITE_ENDPOINT ? 'Set' : 'Not set',
        projectId: process.env.APPWRITE_PROJECT_ID ? 'Set' : 'Not set',
        apiKey: process.env.APPWRITE_API_KEY ? 'Set' : 'Not set',
        bucketId: process.env.APPWRITE_BUCKET_ID ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV || 'development'
    });
});

// Create super-admin endpoint (protected by secret key)
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
            message: 'Super admin created!',
            email: 'superadmin@uchqun.uz',
            password: 'SuperAdmin@2026',
            warning: 'Change password after first login!'
        });
    } catch (error) {
        console.error('Create super-admin error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.use(authenticate);

// Get all children
router.get('/', getChildren);

// Get one child
router.get('/:id', childIdValidator, handleValidationErrors, getChild);

// Update child avatar (NO validators - just photo path)
router.put(
    '/:id/avatar',
    async (req, res) => {
        try {
            const { id } = req.params;
            const { photo } = req.body;
            
            const Child = (await import('../models/Child.js')).default;
            
            const child = await Child.findOne({
                where: { id, parentId: req.user.id }
            });
            
            if (!child) {
                return res.status(404).json({ error: 'Child not found' });
            }
            
            await child.update({ photo });
            await child.reload();
            
            const childData = child.toJSON();
            childData.age = child.getAge();
            
            res.json(childData);
        } catch (error) {
            console.error('Update avatar error:', error);
            res.status(500).json({ error: 'Failed to update avatar' });
        }
    }
);

// Update child + photo upload (supports both multipart and base64)
// Multer middleware will be skipped if Content-Type is application/json
router.put(
    '/:id',
    uploadChildPhoto.single('photo'), // multer (will skip if not multipart)
    childIdValidator,
    handleValidationErrors,
    // SKIP updateChildValidator to allow photoBase64 through
    updateChild
);

// DEBUG endpoint - test multer
router.post('/test-upload', uploadChildPhoto.single('photo'), (req, res) => {
    console.log('=== TEST UPLOAD ===');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    if (req.file) {
        res.json({ 
            success: true, 
            message: 'File received!', 
            file: {
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype,
                path: req.file.path
            }
        });
    } else {
        res.json({ 
            success: false, 
            message: 'No file received',
            body: req.body,
            headers: req.headers
        });
    }
});

export default router;
