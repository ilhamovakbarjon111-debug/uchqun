import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * TeacherResponsibility Model
 * Stores assigned responsibilities for teachers
 * 
 * Business Logic:
 * - Responsibilities are assigned to teachers
 * - Displayed in teacher profile section
 * - Teachers can view their assigned responsibilities
 */
const TeacherResponsibility = sequelize.define('TeacherResponsibility', {
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
    comment: 'Teacher user this responsibility belongs to',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  assignedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active',
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: false,
  },
}, {
  tableName: 'teacher_responsibilities',
  timestamps: true,
});

export default TeacherResponsibility;



