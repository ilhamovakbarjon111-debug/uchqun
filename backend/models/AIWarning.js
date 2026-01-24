import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AIWarning = sequelize.define('AIWarning', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  warningType: {
    type: DataTypes.ENUM('low_rating', 'declining_rating', 'negative_feedback', 'complaint', 'safety_concern', 'quality_issue', 'other'),
    allowNull: false,
    comment: 'Ogohlantirish turi',
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
    allowNull: false,
    comment: 'Ogohlantirish darajasi',
  },
  targetType: {
    type: DataTypes.ENUM('school', 'parent', 'teacher', 'child'),
    allowNull: false,
    comment: 'Maqsad turi',
  },
  targetId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Maqsad ID (school, parent, teacher yoki child)',
  },
  schoolId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'schools',
      key: 'id',
    },
    comment: 'Maktab ID (agar maktab bilan bog\'liq bo\'lsa)',
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Ota-ona ID (agar ota-ona bilan bog\'liq bo\'lsa)',
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Ogohlantirish sarlavhasi',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Ogohlantirish xabari',
  },
  aiAnalysis: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'AI tahlili',
  },
  ratingData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Reyting ma\'lumotlari (AI tahlil uchun)',
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Hal qilinganmi',
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Hal qilingan vaqti',
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Hal qilgan foydalanuvchi',
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Hal qilish eslatmalari',
  },
  notifiedUsers: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: true,
    defaultValue: [],
    comment: 'Xabardor qilingan foydalanuvchilar',
  },
}, {
  tableName: 'ai_warnings',
  timestamps: true,
  indexes: [
    { fields: ['warningType'] },
    { fields: ['severity'] },
    { fields: ['targetType', 'targetId'] },
    { fields: ['schoolId'] },
    { fields: ['parentId'] },
    { fields: ['isResolved'] },
    { fields: ['createdAt'] },
  ],
});

export default AIWarning;
