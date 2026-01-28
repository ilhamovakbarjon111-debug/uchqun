import { DataTypes } from 'sequelize';
import crypto from 'crypto';
import sequelize from '../config/database.js';

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tokenHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'token_hash',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    field: 'user_id',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'revoked_at',
  },
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  underscored: false, // We're using explicit field mappings
});

RefreshToken.hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

RefreshToken.verifyToken = async (token, userId) => {
  const hash = RefreshToken.hashToken(token);
  const record = await RefreshToken.findOne({
    where: { tokenHash: hash, userId, revoked: false },
  });
  if (!record) return null;
  if (record.expiresAt < new Date()) {
    await record.update({ revoked: true, revokedAt: new Date() });
    return null;
  }
  return record;
};

export default RefreshToken;
