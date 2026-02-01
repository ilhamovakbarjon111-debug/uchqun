import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * ParentMeal Model
 * Stores meal information specific to individual parents
 * 
 * Business Logic:
 * - Meals are linked to specific parent users
 * - Parents can only view their own meal records
 * - When viewing parent list, clicking on a parent shows their meals
 */
const ParentMeal = sequelize.define('ParentMeal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: 'Parent user this meal belongs to',
  },
  mealDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  mealType: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
    allowNull: false,
  },
  mealName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dietary restrictions, allergies, etc.',
  },
}, {
  tableName: 'parent_meals',
  timestamps: true,
});

export default ParentMeal;



