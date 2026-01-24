import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Therapy = sequelize.define('Therapy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Terapiya nomi',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Terapiya tavsifi',
  },
  therapyType: {
    type: DataTypes.ENUM('music', 'video', 'content', 'art', 'physical', 'speech', 'occupational', 'other'),
    allowNull: false,
    comment: 'Terapiya turi',
  },
  contentUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Musiqa, video yoki content URL',
  },
  contentType: {
    type: DataTypes.ENUM('audio', 'video', 'image', 'document', 'interactive', 'link'),
    allowNull: true,
    comment: 'Content turi',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Davomiyligi (daqiqalarda)',
  },
  ageGroup: {
    type: DataTypes.ENUM('infant', 'toddler', 'preschool', 'school_age', 'adolescent', 'all'),
    defaultValue: 'all',
    allowNull: false,
    comment: 'Yosh guruhi',
  },
  difficultyLevel: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'all'),
    defaultValue: 'all',
    allowNull: false,
    comment: 'Qiyinlik darajasi',
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'Teglar',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Yaratgan foydalanuvchi',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Foydalanish soni',
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5,
    },
    comment: 'O\'rtacha reyting',
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Reytinglar soni',
  },
}, {
  tableName: 'therapies',
  timestamps: true,
  indexes: [
    { fields: ['therapyType'] },
    { fields: ['ageGroup'] },
    { fields: ['difficultyLevel'] },
    { fields: ['isActive'] },
    { fields: ['createdBy'] },
  ],
});

export default Therapy;
