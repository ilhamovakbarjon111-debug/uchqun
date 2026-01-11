import express from 'express';
import { getChildren, getChild, updateChild } from '../controllers/childController.js';
import { authenticate } from '../middleware/auth.js';
import { updateChildValidator, childIdValidator } from '../validators/childValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { uploadChildPhoto } from '../middleware/uploadChildren.js'; // ✅ To'g'ri yo'l

const router = express.Router();

router.use(authenticate);

// Get all children
router.get('/', getChildren);

// Get one child
router.get('/:id', childIdValidator, handleValidationErrors, getChild);

// Update child + photo upload (parent tomonidan)
// Two routes: one with multer (legacy), one with base64 (new)
router.put(
    '/:id',
    uploadChildPhoto.single('photo'), // multer for legacy support
    childIdValidator,
    updateChildValidator,
    handleValidationErrors,
    updateChild
);

// New base64 upload route (no multer needed)
router.post(
    '/:id/photo',
    childIdValidator,
    handleValidationErrors,
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
