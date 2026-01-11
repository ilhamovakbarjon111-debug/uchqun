import { Op } from 'sequelize';
import Child from '../models/Child.js';
import User from '../models/User.js';
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
    logger.error('Get children error:', { error: error.message });
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
      ],
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const childData = child.toJSON();
    childData.age = child.getAge();

    res.json(childData);
  } catch (error) {
    logger.error('Get child error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get child' });
  }
};

export const updateChild = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('=== UPDATE CHILD DEBUG ===');
    logger.info('Child ID:', { childId: id });
    logger.info('User ID:', { userId: req.user.id });
    logger.info('req.file:', { file: req.file });
    logger.info('req.body:', { body: req.body });
    logger.info('Content-Type:', { contentType: req.headers['content-type'] });

    const child = await Child.findOne({
      where: {
        id,
        parentId: req.user.id,
      },
    });

    if (!child) {
      logger.warn('Child not found', { childId: id, userId: req.user.id });
      return res.status(404).json({ error: 'Child not found' });
    }

    logger.info('Current child photo before update:', { photo: child.photo });

    const updateData = { ...req.body };

    // ✅ RASMNI ANIQ YOZISH
    if (req.file) {
      updateData.photo = `/uploads/children/${req.file.filename}`;
      logger.info('✅ Photo received! Setting path to:', { path: updateData.photo });
      logger.info('File details:', {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      });
    } else {
      logger.warn('⚠️ No file received in request!');
      logger.warn('req.file is undefined or null');
    }

    logger.info('Update data to be applied:', { updateData });

    await child.update(updateData);

    // Refresh child data from database
    await child.reload();

    const childData = child.toJSON();
    childData.age = child.getAge();

    logger.info('=== UPDATE COMPLETE ===');
    logger.info('Updated child photo from DB:', { photo: childData.photo });

    res.json(childData);
  } catch (error) {
    logger.error('❌ Update child error:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to update child', message: error.message });
  }
};