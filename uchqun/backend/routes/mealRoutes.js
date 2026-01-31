import express from 'express';
import { 
  getMeals, 
  getMeal, 
  createMeal, 
  updateMeal, 
  deleteMeal 
} from '../controllers/mealController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createMealValidator, updateMealValidator, mealIdValidator } from '../validators/mealValidator.js';
import { paginationValidator, dateQueryValidator, childIdQueryValidator } from '../validators/queryValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);

router.get('/', paginationValidator.concat(dateQueryValidator).concat(childIdQueryValidator), handleValidationErrors, getMeals);
router.get('/:id', mealIdValidator, handleValidationErrors, getMeal);

// CRUD operations (teachers only)
router.post('/', requireRole('teacher', 'admin'), createMealValidator, handleValidationErrors, createMeal);
router.put('/:id', requireRole('teacher', 'admin'), mealIdValidator.concat(updateMealValidator), handleValidationErrors, updateMeal);
router.delete('/:id', requireRole('teacher', 'admin'), mealIdValidator, handleValidationErrors, deleteMeal);

export default router;

