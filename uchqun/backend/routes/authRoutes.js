import express from 'express';
import { login, refreshToken, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginValidator, refreshTokenValidator } from '../validators/authValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { submitRegistrationRequest } from '../controllers/adminRegistrationController.js';
import { uploadDocuments, handleUploadError, debugMulter } from '../middleware/upload.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/login', loginValidator, handleValidationErrors, login);
router.post('/refresh', refreshTokenValidator, handleValidationErrors, refreshToken);
router.get('/me', authenticate, getMe);

// Admin registration request (public endpoint) - with file uploads
// Debug middleware to see what multer receives
router.post('/admin-register', (req, res, next) => {
  logger.info('Admin register request received', {
    contentType: req.headers['content-type'],
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
  });
  next();
}, uploadDocuments, (req, res, next) => {
  logger.info('After multer processing', {
    body: req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    files: req.files ? Object.keys(req.files) : [],
    hasCertificate: !!(req.files?.certificateFile),
    hasPassport: !!(req.files?.passportFile),
  });
  next();
}, handleUploadError, submitRegistrationRequest);

export default router;

