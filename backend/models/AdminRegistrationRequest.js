import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AdminRegistrationRequest = sequelize.define('AdminRegistrationRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Admin first name',
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Admin last name',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
    comment: 'Admin email address',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Admin phone number',
  },
  passportNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Passport serial number',
  },
  passportSeries: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Passport series (if applicable)',
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Location/address of the admin',
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Region/state of the admin',
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'City of the admin',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'Status of the registration request',
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Super-admin who reviewed this request',
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the request was reviewed',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for rejection (if rejected)',
  },
  approvedUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User ID created after approval',
  },
}, {
  tableName: 'admin_registration_requests',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['status'] },
    { fields: ['reviewedBy'] },
    { fields: ['createdAt'] },
  ],
});

export default AdminRegistrationRequest;
