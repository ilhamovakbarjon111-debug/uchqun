import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * TeacherWorkHistory Model
 * Stores work history, deadlines, and performance records for teachers
 * 
 * Business Logic:
 * - Work history is linked to teachers
 * - Displayed in teacher profile section
 * - Includes deadlines and historical work records
 */
const TeacherWorkHistory = sequelize.define('TeacherWorkHistory', {
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
  workDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  workType: {
    type: DataTypes.ENUM('assignment', 'report', 'meeting', 'training', 'evaluation', 'other'),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'teacher_work_history',
  timestamps: true,
});

export default TeacherWorkHistory;



