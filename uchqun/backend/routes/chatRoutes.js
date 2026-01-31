import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  listMessages,
  createMessage,
  markConversationRead,
  updateMessage,
  deleteMessage,
} from '../controllers/chatController.js';

const router = express.Router();

router.use(authenticate);

router.get('/messages', listMessages);
router.post('/messages', createMessage);
router.post('/read', markConversationRead);
router.put('/messages/:id', updateMessage);
router.delete('/messages/:id', deleteMessage);

export default router;

