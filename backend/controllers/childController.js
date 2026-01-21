import { Op } from 'sequelize';
import Child from '../models/Child.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import { uploadFile } from '../config/storage.js';
import logger from '../utils/logger.js';

// Get all children for the logged-in parent
export const getChildren = async (req, res) => {
  try {
    const children = await Child.findAll({
      where: { parentId: req.user.id },
      include: [
        {
          model: User,
          as: 'parent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          model: Group,
          as: 'childGroup',
          attributes: ['id', 'name'],
          required: false, // Child may not have a group
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    const childrenData = children.map(child => {
      const data = child.toJSON();
      data.age = child.getAge();
      return data;
    });

    res.json(childrenData);
  } catch (error) {
    logger.error('Get children error', { error: error.message, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to get children' });
  }
};

// Get a specific child by ID (for parents, only their own children)
export const getChild = async (req, res) => {
  try {
    const { id } = req.params;

    const child = await Child.findOne({
      where: {
        id,
        parentId: req.user.id
      },
      include: [
        {
          model: User,
          as: 'parent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          model: Group,
          as: 'childGroup',
          attributes: ['id', 'name'],
          required: false, // Child may not have a group
        },
      ],
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const childData = child.toJSON();
    childData.age = child.getAge();

    res.json(childData);
  } catch (error) {
    logger.error('Get child error', { error: error.message, childId: req.params?.id, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to get child' });
  }
};

export const updateChild = async (req, res) => {
  try {
    const { id } = req.params;

    const child = await Child.findOne({
      where: {
        id,
        parentId: req.user.id,
      },
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const updateData = { ...req.body };

    // Handle photo upload - supports both multipart (req.file) and base64 (req.body.photoBase64)
    if (req.file) {
      try {
        const fileBuffer = req.file.buffer;
        const filename = `child-${id}-${Date.now()}${req.file.originalname.substring(req.file.originalname.lastIndexOf('.'))}`;

        const uploadResult = await uploadFile(fileBuffer, filename, req.file.mimetype);
        updateData.photo = uploadResult.url;
        delete updateData.photoBase64;
      } catch (uploadError) {
        logger.error('Photo upload error (multipart)', { error: uploadError.message, childId: id });
        return res.status(500).json({ error: 'Failed to upload photo' });
      }
    } else if (req.body.photoBase64) {
      try {
        const matches = req.body.photoBase64.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({ error: 'Invalid base64 photo format' });
        }

        const mimetype = matches[1];
        const base64Data = matches[2];
        const fileBuffer = Buffer.from(base64Data, 'base64');
        const extension = mimetype.split('/')[1] || 'jpg';
        const filename = `child-${id}-${Date.now()}.${extension}`;

        const uploadResult = await uploadFile(fileBuffer, filename, mimetype);
        updateData.photo = uploadResult.url;
        delete updateData.photoBase64;
      } catch (uploadError) {
        logger.error('Photo upload error (base64)', { error: uploadError.message, childId: id });
        return res.status(500).json({ error: 'Failed to upload photo' });
      }
    }

    await child.update(updateData);
    await child.reload();

    const childData = child.toJSON();
    childData.age = child.getAge();

    res.json(childData);
  } catch (error) {
    logger.error('Update child error', { error: error.message, childId: req.params?.id, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to update child' });
  }
};