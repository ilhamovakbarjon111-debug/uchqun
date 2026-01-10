import express from 'express';
import multer from 'multer';
import { getChildren, getChild, updateChild } from '../controllers/childController.js';
import { authenticate } from '../middleware/auth.js';
import { updateChildValidator, childIdValidator } from '../validators/childValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// --- Multer setup for children photos ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/children'); // papka yo'li
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});
const upload = multer({ storage });

router.use(authenticate);

// Get all children for the logged-in parent
router.get('/', getChildren);

// Get a specific child by ID
router.get('/:id', childIdValidator, handleValidationErrors, getChild);

// Update a specific child by ID
// Multerni qo'shish: "photo" field bilan fayl keladi
router.put(
    '/:id',
    childIdValidator,
    upload.single('photo'), // multer qo'shildi
    updateChildValidator,
    handleValidationErrors,
    updateChild
);

export default router;
