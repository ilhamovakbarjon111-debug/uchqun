import express from 'express';
import { getChildren, getChild, updateChild } from '../controllers/childController.js';
import { authenticate } from '../middleware/auth.js';
import { updateChildValidator, childIdValidator } from '../validators/childValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { uploadChildPhoto } from '../middlewares/uploadChildren.js'; // 🔥 import qilindi

const router = express.Router();

router.use(authenticate);

// Get all children
router.get('/', getChildren);

// Get one child
router.get('/:id', childIdValidator, handleValidationErrors, getChild);

// Update child + photo upload (parent tomonidan)
router.put(
    '/:id',
    uploadChildPhoto.single('photo'), // 🔴 multer import qilindi
    childIdValidator,
    updateChildValidator,
    handleValidationErrors,
    updateChild
);

export default router;
