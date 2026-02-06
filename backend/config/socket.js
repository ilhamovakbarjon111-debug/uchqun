import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { User } from '../models/index.js';

/**
 * Socket.IO Configuration and Setup
 * Handles real-time bidirectional communication between backend and clients
 */

let io = null;

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance from Express
 * @returns {Server} Socket.IO server instance
 */
export function initializeSocket(httpServer) {
  // CORS configuration for Socket.IO (must match allowed origins)
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'https://uchqun-platform.vercel.app',
    'https://uchqunedu.uz',
    'https://www.uchqunedu.uz',
    'https://uchqun-reception.netlify.app',
    'https://uchqun-admin.netlify.app',
    'https://uchqun-teacher.netlify.app',
    'https://uchqun-government.netlify.app',
    'https://uchqun-super-admin.netlify.app',
  ];

  const allowedOrigins = process.env.FRONTEND_URL
    ? [
        ...defaultOrigins,
        ...process.env.FRONTEND_URL.split(',').map(url => url.trim()).filter(url => {
          return !url.includes('uchqun-production-4f83');
        })
      ].filter((url, index, self) => self.indexOf(url) === index)
    : defaultOrigins;

  const allowAllOrigins = process.env.NODE_ENV === 'production'
    ? process.env.CORS_STRICT === 'false'
    : process.env.CORS_STRICT !== 'true' ? true : false;

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (allowAllOrigins) {
          return callback(null, true);
        }

        // Allow requests with no origin (mobile apps)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Development: allow localhost
        if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
          return callback(null, true);
        }

        // Production: allow deployment platforms
        if (process.env.NODE_ENV === 'production') {
          if (origin.includes('.netlify.app') || origin.includes('.vercel.app')) {
            return callback(null, true);
          }
        }

        logger.warn('Socket.IO CORS blocked origin:', { origin });
        callback(new Error(`Socket.IO CORS: Origin ${origin} is not allowed`));
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    // Connection options
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'], // WebSocket preferred, polling fallback
  });

  logger.info('Socket.IO server initialized', {
    origins: allowAllOrigins ? 'all' : allowedOrigins,
    environment: process.env.NODE_ENV,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // Extract token from handshake auth
      const token = socket.handshake.auth?.token ||
                   socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        logger.warn('Socket connection rejected: No token provided', {
          socketId: socket.id,
          origin: socket.handshake.headers.origin,
        });
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Load user from database
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive'],
      });

      if (!user) {
        logger.warn('Socket connection rejected: User not found', {
          socketId: socket.id,
          userId: decoded.userId,
        });
        return next(new Error('User not found'));
      }

      // Attach user to socket for use in event handlers
      socket.user = user;

      logger.info('Socket authenticated', {
        socketId: socket.id,
        userId: user.id,
        role: user.role,
        email: user.email,
      });

      next();
    } catch (error) {
      logger.error('Socket authentication failed', {
        socketId: socket.id,
        error: error.message,
      });

      if (error.name === 'TokenExpiredError') {
        return next(new Error('Token expired'));
      }

      return next(new Error('Authentication failed'));
    }
  });

  // Connection event handlers
  io.on('connection', (socket) => {
    const { user } = socket;

    logger.info('Client connected', {
      socketId: socket.id,
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // Join user to role-specific room for targeted broadcasts
    socket.join(`role:${user.role}`);
    socket.join(`user:${user.id}`);

    logger.debug('Socket joined rooms', {
      socketId: socket.id,
      rooms: Array.from(socket.rooms),
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('Client disconnected', {
        socketId: socket.id,
        userId: user.id,
        reason,
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', {
        socketId: socket.id,
        userId: user.id,
        error: error.message,
      });
    });

    // Ping-pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  return io;
}

/**
 * Get Socket.IO server instance
 * @returns {Server|null} Socket.IO server instance or null if not initialized
 */
export function getIO() {
  if (!io) {
    logger.warn('Socket.IO accessed before initialization');
  }
  return io;
}

/**
 * Emit event to specific user(s)
 * @param {string|string[]} userId - User ID or array of user IDs
 * @param {string} event - Event name
 * @param {Object} data - Event payload
 */
export function emitToUser(userId, event, data) {
  if (!io) {
    logger.error('Cannot emit to user: Socket.IO not initialized');
    return;
  }

  const userIds = Array.isArray(userId) ? userId : [userId];

  userIds.forEach(id => {
    io.to(`user:${id}`).emit(event, data);
    logger.debug('Event emitted to user', {
      userId: id,
      event,
      dataKeys: Object.keys(data),
    });
  });
}

/**
 * Emit event to all users with specific role
 * @param {string|string[]} role - User role or array of roles
 * @param {string} event - Event name
 * @param {Object} data - Event payload
 */
export function emitToRole(role, event, data) {
  if (!io) {
    logger.error('Cannot emit to role: Socket.IO not initialized');
    return;
  }

  const roles = Array.isArray(role) ? role : [role];

  roles.forEach(r => {
    io.to(`role:${r}`).emit(event, data);
    logger.debug('Event emitted to role', {
      role: r,
      event,
      dataKeys: Object.keys(data),
    });
  });
}

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {Object} data - Event payload
 */
export function emitToAll(event, data) {
  if (!io) {
    logger.error('Cannot emit to all: Socket.IO not initialized');
    return;
  }

  io.emit(event, data);
  logger.debug('Event emitted to all', {
    event,
    dataKeys: Object.keys(data),
  });
}

export default { initializeSocket, getIO, emitToUser, emitToRole, emitToAll };
