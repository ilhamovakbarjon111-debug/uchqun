import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * TeacherTask Model
 * Stores tasks performed by teachers
 * 
 * Business Logic:
 * - Tasks are linked to teachers
 * - Displayed in teacher profile section
 * - Teachers can view tasks they have performed
 */
const TeacherTask = sequelize.define('TeacherTask', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  taskDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'teacher_tasks',
  timestamps: true,
});

export default TeacherTask;



