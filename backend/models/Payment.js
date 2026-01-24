import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
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
    comment: 'To\'lov qilgan ota-ona',
  },
  childId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'children',
      key: 'id',
    },
    comment: 'Bolalar ID (agar mavjud bo\'lsa)',
  },
  schoolId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'schools',
      key: 'id',
    },
    comment: 'Maktab ID',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'To\'lov summasi',
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'UZS',
    allowNull: false,
    comment: 'Valyuta (UZS, USD, va hokazo)',
  },
  paymentType: {
    type: DataTypes.ENUM('tuition', 'therapy', 'meal', 'activity', 'other'),
    allowNull: false,
    comment: 'To\'lov turi',
  },
  paymentMethod: {
    type: DataTypes.ENUM('card', 'bank_transfer', 'cash', 'mobile_payment', 'online', 'other'),
    allowNull: false,
    comment: 'To\'lov usuli',
  },
  paymentProvider: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'To\'lov provayderi (Payme, Click, Uzcard, va hokazo)',
  },
  transactionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    comment: 'Tranzaksiya ID (provayderdan)',
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'To\'lov holati',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'To\'lov tavsifi',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Qo\'shimcha ma\'lumotlar',
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'To\'langan vaqti',
  },
  receiptUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Chek URL',
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Qaytarilgan summa (agar mavjud bo\'lsa)',
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Qaytarilgan vaqti',
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Qaytarish sababi',
  },
}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    { fields: ['parentId'] },
    { fields: ['childId'] },
    { fields: ['schoolId'] },
    { fields: ['status'] },
    { fields: ['paymentType'] },
    { fields: ['transactionId'] },
    { fields: ['paidAt'] },
  ],
});

export default Payment;
