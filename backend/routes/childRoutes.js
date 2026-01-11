import express from 'express';
import multer from 'multer';
import path from 'path';

import { getChildren, getChild, updateChild } from '../controllers/childController.js';
import { authenticate } from '../middleware/auth.js';
import { updateChildValidator, childIdValidator } from '../validators/childValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

/* =======================
   MULTER CONFIG
======================= */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/children');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `child-${req.params.id}-${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* =======================
   ROUTES
======================= */

router.use(authenticate);

// Get all children
router.get('/', getChildren);

// Get one child
router.get(
    '/:id',
    childIdValidator,
    handleValidationErrors,
    getChild
);

// Update child + photo upload (parent tomonidan)
router.put(
    '/:id',
    upload.single('photo'), // 🔴 MULTER HAR DOIM BIRINCHI
    childIdValidator,
    updateChildValidator,
    handleValidationErrors,
    updateChild
);

export default router;
