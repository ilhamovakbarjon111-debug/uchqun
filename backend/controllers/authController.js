import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { generateCsrfToken } from '../middleware/csrf.js';
import logger from '../utils/logger.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, jti: crypto.randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, jti: crypto.randomUUID() },
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

    // Store refresh token hash in DB
    // Wrap in try-catch to prevent login failure if table doesn't exist yet
    try {
      await RefreshToken.create({
        tokenHash: RefreshToken.hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch (tokenError) {
      // Log error but don't fail login - tokens are still set in cookies
      logger.error('Failed to store refresh token in DB', {
        error: tokenError.message,
        stack: tokenError.stack,
        userId: user.id,
      });
      console.warn('⚠ Failed to store refresh token in DB, but login continues');
      // Continue with login - tokens are set in cookies, so user can still use the app
    }

    // Set CSRF token cookie (non-httpOnly so JS can read it)
    const csrfToken = generateCsrfToken();
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      csrfToken,
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
  // Set timeout to prevent client from closing connection
  req.setTimeout(30000); // 30 seconds
  
  try {
    // Read from cookie first, fall back to body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify JWT first (fast operation, no DB)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError' || jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }
      throw jwtError;
    }

    // Parallel database queries for better performance
    const [user, storedToken] = await Promise.all([
      User.findByPk(decoded.userId, {
        attributes: ['id', 'email', 'role', 'name'],
        raw: false, // Get instance for potential updates
      }),
      RefreshToken.verifyToken(token, decoded.userId),
    ]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    if (!storedToken) {
      return res.status(401).json({ error: 'Refresh token revoked or expired' });
    }

    // Issue new tokens (synchronous operation)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
    const csrfToken = generateCsrfToken();

    // Parallel database operations
    await Promise.all([
      // Revoke old token (rotation)
      storedToken.update({ revoked: true, revokedAt: new Date() }),
      // Store new refresh token hash
      RefreshToken.create({
        tokenHash: RefreshToken.hashToken(newRefreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
    ]);

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };

    // Set cookies
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send response immediately
    res.json({
      success: true,
      accessToken,
      csrfToken,
    });
  } catch (error) {
    // Handle specific errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    
    // Log error with context
    logger.error('Refresh token error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.body?.refreshToken ? 'from-body' : 'from-cookie',
    });
    
    // Send error response
    if (!res.headersSent) {
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }
};

export const logout = async (req, res) => {
  try {
    // Revoke all refresh tokens for this user
    await RefreshToken.update(
      { revoked: true, revokedAt: new Date() },
      { where: { userId: req.user.id, revoked: false } }
    );

    // Clear all cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('csrfToken', { ...cookieOptions, httpOnly: false });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error', { error: error.message, userId: req.user?.id });
    res.status(500).json({ error: 'Logout failed' });
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

