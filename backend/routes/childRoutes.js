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

router.use(authenticate);

// Get all children
router.get('/', getChildren);

// Get one child
router.get('/:id', childIdValidator, handleValidationErrors, getChild);

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
