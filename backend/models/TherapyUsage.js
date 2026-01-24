import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TherapyUsage = sequelize.define('TherapyUsage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  therapyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'therapies',
      key: 'id',
    },
  },
  childId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'children',
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
  teacherId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Boshlanish vaqti',
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tugash vaqti',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Davomiyligi (daqiqalarda)',
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
    comment: 'Taraqqiyot foizi',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Qo\'shimcha eslatmalar',
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
    comment: 'Foydalanuvchi reytingi',
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Foydalanuvchi fikri',
  },
}, {
  tableName: 'therapy_usages',
  timestamps: true,
  indexes: [
    { fields: ['therapyId'] },
    { fields: ['childId'] },
    { fields: ['parentId'] },
    { fields: ['teacherId'] },
    { fields: ['startTime'] },
  ],
});

export default TherapyUsage;
