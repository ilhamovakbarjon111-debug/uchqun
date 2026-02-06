// Socket.io configuration (if needed in the future)
// Currently not used, but file exists to prevent import errors

// Import User model correctly from models/index.js (using named export)
import { User } from '../models/index.js';

// Export for potential future use
export { User };

// Placeholder for socket.io setup (if needed later)
export const initializeSocket = (server) => {
  // Socket.io initialization code would go here
  // For now, this is just a placeholder
  return null;
};

export default {
  User,
  initializeSocket,
};
