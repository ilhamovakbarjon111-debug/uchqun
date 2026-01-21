import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

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
    logger.error('listMessages error', err);
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
    logger.error('createMessage error', err);
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
    logger.error('markConversationRead error', err);
    res.status(500).json({ error: 'Failed to mark read' });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!id) return res.status(400).json({ error: 'id is required' });
    if (!content?.trim()) return res.status(400).json({ error: 'content is required' });

    const msg = await ChatMessage.findByPk(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    if (!canAccessConversation(req, msg.conversationId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'superAdmin';
    const isOwner = msg.senderId === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Only the sender can edit this message' });
    }

    msg.content = content.trim();
    await msg.save();

    res.json(msg);
  } catch (err) {
    logger.error('updateMessage error', err);
    res.status(500).json({ error: 'Failed to update message' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'id is required' });

    const msg = await ChatMessage.findByPk(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    if (!canAccessConversation(req, msg.conversationId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'superAdmin';
    const isTeacher = req.user.role === 'teacher';
    const isOwner = msg.senderId === req.user.id;
    // Allow moderation: teacher/admin can delete any message in allowed conversations
    if (!isAdmin && !isTeacher && !isOwner) {
      return res.status(403).json({ error: 'Only the sender can delete this message' });
    }

    await msg.destroy();
    res.json({ success: true });
  } catch (err) {
    logger.error('deleteMessage error', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
