import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TeacherRating = sequelize.define('TeacherRating', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  stars: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'teacher_ratings',
  timestamps: true,
  indexes: [
    { fields: ['teacherId'] },
    { unique: true, fields: ['teacherId', 'parentId'] },
  ],
});

export default TeacherRating;

