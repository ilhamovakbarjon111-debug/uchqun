// Socket.io configuration (if needed in the future)
// Currently not used, but file exists to prevent import errors

// Import User model correctly from models/index.js (using named export)
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

// Export for potential future use
export { User };

// Placeholder socket.io instance (will be initialized when socket.io is set up)
let io = null;

// Initialize socket.io
export const initializeSocket = (server) => {
  // Socket.io initialization code would go here
  // For now, this is just a placeholder
  // When socket.io is added, uncomment and configure:
  /*
  import { Server } from 'socket.io';
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173'],
      credentials: true,
    },
  });
  */
  logger.info('Socket.io placeholder initialized (not configured yet)');
  return io;
};

// Emit event to a specific user (placeholder function)
export const emitToUser = async (userId, event, data) => {
  try {
    if (!io) {
      // Socket.io not initialized, just log for now
      logger.debug('emitToUser called but socket.io not initialized', {
        userId,
        event,
        hasData: !!data,
      });
      return;
    }

    // When socket.io is set up, implement actual emission:
    /*
    const userSockets = await getUserSockets(userId);
    userSockets.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
    */
    
    logger.debug('emitToUser (placeholder)', { userId, event });
  } catch (error) {
    logger.error('emitToUser error', {
      error: error.message,
      userId,
      event,
    });
  }
};

// Get socket.io instance (for future use)
export const getIO = () => io;

export default {
  User,
  initializeSocket,
  emitToUser,
  getIO,
};
