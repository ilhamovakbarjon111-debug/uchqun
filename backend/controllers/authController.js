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
    });

    if (!email || !password) {
      logger.warn('Login attempt with missing credentials', { 
        email: email ? 'provided' : 'missing',
        hasPassword: !!password,
        bodyKeys: Object.keys(req.body || {})
      });
      return res.status(400).json({ 
        error: 'Email and password are required',
        details: process.env.NODE_ENV === 'development' ? {
          receivedEmail: !!email,
          receivedPassword: !!password,
          bodyKeys: Object.keys(req.body || {})
        } : undefined
      });
    }

    // Email already normalized by validator, but ensure it's lowercase and trimmed
    const normalizedEmail = (email || '').toLowerCase().trim();
    
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
      logger.warn('Login attempt with non-existent email');
      return res.status(401).json({ 
        error: 'Invalid email or password',
        message: 'The email address or password you entered is incorrect. Please check and try again.'
      });
    }

    logger.info('User found', {
      userId: user.id,
      role: user.role,
    });

    // Debug: Check if password field exists and is a valid hash
    if (!user.password) {
      logger.error('User found but password field is missing', { userId: user.id });
      return res.status(500).json({ error: 'User account error. Please contact support.' });
    }

    // Check if password is a valid bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (!user.password.startsWith('$2')) {
      logger.error('User password is not properly hashed', {
        userId: user.id,
      });
      return res.status(500).json({ error: 'User account error. Password needs to be reset.' });
    }

    logger.info('Comparing password', { userId: user.id });
    
    // Direct bcrypt comparison for debugging
    const bcrypt = await import('bcryptjs');
    const directCompare = await bcrypt.default.compare(password, user.password);
    const methodCompare = await user.comparePassword(password);
    
    logger.info('Password comparison result', {
      userId: user.id,
      isValid: methodCompare || directCompare,
    });
    
    const isPasswordValid = methodCompare || directCompare;
    
    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password', {
        userId: user.id,
      });
      return res.status(401).json({ 
        error: 'Invalid email or password',
        message: 'The email address or password you entered is incorrect. Please check and try again.'
      });
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

    // Business Logic: Admin must be active to log in (except super-admin)
    if (user.role === 'admin' && user.email !== 'superadmin@uchqun.uz') {
      if (!user.isActive) {
        return res.status(403).json({ 
          error: 'Admin account is not active. Please contact super-admin.',
          requiresApproval: true,
        });
      }
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      logger.error('JWT secrets not configured', {
        hasJWT_SECRET: !!process.env.JWT_SECRET,
        hasJWT_REFRESH_SECRET: !!process.env.JWT_REFRESH_SECRET,
      });
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Authentication service is not properly configured. Please contact support.'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    logger.info('Successful login', { userId: user.id, role: user.role });

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      email: req.body?.email ? req.body.email.substring(0, 3) + '***' : 'missing'
    });
    logger.error('Login error', { 
      error: error.message, 
      stack: error.stack,
      name: error.name,
      email: req.body?.email ? req.body.email.substring(0, 3) + '***' : 'missing'
    });
    res.status(500).json({ error: 'Login failed', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
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

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

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

