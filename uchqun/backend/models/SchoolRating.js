import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SchoolRating = sequelize.define('SchoolRating', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  schoolId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'schools',
      key: 'id',
    },
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
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
  tableName: 'school_ratings',
  timestamps: true,
  indexes: [
    { fields: ['schoolId'] },
    { unique: true, fields: ['schoolId', 'parentId'] },
  ],
});

export default SchoolRating;
