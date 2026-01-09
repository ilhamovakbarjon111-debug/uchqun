import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';

const buildConversationId = (parentId) => `parent:${parentId}`;

const canAccessConversation = (req, conversationId) => {
  const isParent = req.user.role === 'parent';
  if (isParent) {
    return conversationId === buildConversationId(req.user.id);
  }
  // teacher/admin can access any
  return true;
};

export const listMessages = async (req, res) => {
  try {
    const { conversationId, limit = 200, offset = 0 } = req.query;
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }
    if (!canAccessConversation(req, conversationId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const msgs = await ChatMessage.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
      limit: Math.min(parseInt(limit, 10) || 200, 500),
      offset: parseInt(offset, 10) || 0,
    });

    res.json(msgs);
  } catch (err) {
    console.error('listMessages error', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    if (!conversationId || !content?.trim()) {
      return res.status(400).json({ error: 'conversationId and content are required' });
    }
    if (!canAccessConversation(req, conversationId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const senderRole = req.user.role === 'parent' ? 'parent' : 'teacher';
    const msg = await ChatMessage.create({
      conversationId,
      senderId: req.user.id,
      senderRole,
      content: content.trim(),
      readByParent: senderRole === 'parent',
      readByTeacher: senderRole === 'teacher',
    });

    res.status(201).json(msg);
  } catch (err) {
    console.error('createMessage error', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const markConversationRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }
    if (!canAccessConversation(req, conversationId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const role = req.user.role === 'parent' ? 'parent' : 'teacher';
    await ChatMessage.update(
      role === 'parent' ? { readByParent: true } : { readByTeacher: true },
      { where: { conversationId } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('markConversationRead error', err);
    res.status(500).json({ error: 'Failed to mark read' });
  }
};

