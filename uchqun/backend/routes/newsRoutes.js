import express from 'express';
import {
  getNews,
  getNewsItem,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createNewsValidator,
  updateNewsValidator,
  newsIdValidator,
} from '../validators/newsValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { paginationValidator } from '../validators/queryValidator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get news - accessible to all authenticated users (published only for non-admins)
router.get('/', 
  paginationValidator,
  handleValidationErrors,
  getNews
);

router.get('/:id', 
  newsIdValidator,
  handleValidationErrors,
  getNewsItem
);

// Create, update, delete - admin only
router.post('/', 
  requireRole('admin'),
  createNewsValidator,
  handleValidationErrors,
  createNews
);

router.put('/:id', 
  requireRole('admin'),
  newsIdValidator,
  updateNewsValidator,
  handleValidationErrors,
  updateNews
);

router.delete('/:id', 
  requireRole('admin'),
  newsIdValidator,
  handleValidationErrors,
  deleteNews
);

export default router;



