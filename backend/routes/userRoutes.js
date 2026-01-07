import express from 'express';
import { updateProfile, changePassword } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { updateProfileValidator, changePasswordValidator } from '../validators/userValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

router.put('/profile', updateProfileValidator, handleValidationErrors, updateProfile);
router.put('/password', changePasswordValidator, handleValidationErrors, changePassword);

export default router;

