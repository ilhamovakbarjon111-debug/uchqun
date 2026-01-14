import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info('Login attempt', { 
      email: email ? email.substring(0, 3) + '***' : 'missing',
      hasPassword: !!password,
      bodyKeys: Object.keys(req.body),
      emailValue: email
    });

    if (!email || !password) {
      logger.warn('Login attempt with missing credentials', { email: email ? 'provided' : 'missing' });
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Email already normalized by validator, but ensure it's lowercase and trimmed
    const normalizedEmail = (email || '').toLowerCase().trim();
    logger.info('Searching for user', { normalizedEmail, originalEmail: email });
    
    // Try exact match first
    let user = await User.findOne({ where: { email: normalizedEmail } });
    
    // If not found, try case-insensitive search (in case database has different case)
    if (!user) {
      const { Op } = await import('sequelize');
      user = await User.findOne({ 
        where: { 
          email: { [Op.iLike]: normalizedEmail } 
        } 
      });
    }
    
    if (!user) {
      logger.warn('Login attempt with non-existent email', { 
        normalizedEmail,
        searchedWith: 'exact and case-insensitive'
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    logger.info('User found', { 
      userId: user.id, 
      role: user.role,
      email: user.email,
      hasPassword: !!user.password,
      passwordStartsWith: user.password ? user.password.substring(0, 7) : 'none'
    });

    // Debug: Check if password field exists and is a valid hash
    if (!user.password) {
      logger.error('User found but password field is missing', { email: normalizedEmail, userId: user.id });
      return res.status(500).json({ error: 'User account error. Please contact support.' });
    }

    // Check if password is a valid bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (!user.password.startsWith('$2')) {
      logger.error('User password is not properly hashed', { 
        email: normalizedEmail, 
        userId: user.id,
        passwordLength: user.password?.length 
      });
      return res.status(500).json({ error: 'User account error. Password needs to be reset.' });
    }

    logger.info('Comparing password', { userId: user.id });
    const isPasswordValid = await user.comparePassword(password);
    logger.info('Password comparison result', { 
      userId: user.id,
      isValid: isPasswordValid 
    });
    
    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password', { 
        email: normalizedEmail, 
        userId: user.id,
        passwordHashPrefix: user.password.substring(0, 7) // First 7 chars of hash for debugging
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Business Logic: Reception cannot log in until documents are approved by Admin
    if (user.role === 'reception') {
      if (!user.documentsApproved || !user.isActive) {
        return res.status(403).json({ 
          error: 'Account not approved. Please wait for Admin approval.',
          requiresApproval: true,
          documentsApproved: user.documentsApproved,
          isActive: user.isActive,
        });
      }
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    logger.info('Successful login', { email: normalizedEmail, userId: user.id, role: user.role });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const { accessToken } = generateTokens(user.id);

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    logger.error('Refresh token error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    // Explicitly exclude password and ensure we only return the current authenticated user's data
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Ensure we're only returning the authenticated user's data (security check)
    if (user.id !== req.user.id) {
      logger.warn('Security: Attempted to access different user data', {
        requestedUserId: req.user.id,
        returnedUserId: user.id,
      });
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(user.toJSON());
  } catch (error) {
    logger.error('Get me error', { error: error.message, stack: error.stack, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to get user' });
  }
};

