import logger from '../utils/logger.js';

const isProduction = process.env.NODE_ENV === 'production';

export const errorHandler = (err, req, res, next) => {
  // Log full error details server-side
  logger.error('Request error', {
    correlationId: req.correlationId,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      status: err.status,
    },
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    role: req.user?.role,
  });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: isProduction 
        ? ['One or more validation errors occurred']
        : err.errors.map(e => e.message),
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: isProduction
        ? 'A record with this information already exists'
        : err.errors.map(e => e.message).join(', '),
    });
  }

  // Sequelize database errors
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      error: 'Database error',
      message: isProduction
        ? 'An error occurred while processing your request'
        : err.message,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication error',
      message: 'Invalid or expired token',
    });
  }

  // Rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too many requests',
      message: err.message || 'Too many requests from this IP, please try again later',
    });
  }

  // Client errors (4xx)
  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({
      error: err.message || 'Bad request',
      ...(isProduction ? {} : { details: err.details }),
    });
  }

  // Server errors (5xx) - hide internal details in production
  const status = err.status || 500;
  return res.status(status).json({
    error: isProduction 
      ? 'An unexpected error occurred'
      : err.message || 'Internal server error',
    ...(isProduction ? {} : { 
      details: err.details,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }),
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

