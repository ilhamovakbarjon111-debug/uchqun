import express from 'express';
import { getProgress, updateProgress } from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getProgress);
router.put('/', updateProgress);

export default router;



