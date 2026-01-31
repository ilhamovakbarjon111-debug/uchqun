import { DataTypes, Op } from 'sequelize';
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
  try {
    const hash = RefreshToken.hashToken(token);
    const now = new Date();
    
    // Optimized query with expiration check in WHERE clause
    const record = await RefreshToken.findOne({
      where: { 
        tokenHash: hash, 
        userId, 
        revoked: false,
        expiresAt: {
          [Op.gt]: now, // expiresAt > now
        },
      },
    });
    
    // If record found, it's valid (expiration already checked in query)
    return record;
  } catch (error) {
    // Log error but don't throw - let controller handle it
    console.error('RefreshToken.verifyToken error:', error.message);
    return null;
  }
};

export default RefreshToken;
