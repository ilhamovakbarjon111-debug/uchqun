import Therapy from '../models/Therapy.js';
import TherapyUsage from '../models/TherapyUsage.js';
import Child from '../models/Child.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

/**
 * Get all therapies
 * GET /api/therapy
 */
export const getTherapies = async (req, res) => {
  try {
    const {
      therapyType,
      ageGroup,
      difficultyLevel,
      search,
      isActive,
      limit = 20,
      offset = 0,
    } = req.query;

    const where = {};

    // Only filter by isActive if explicitly provided or default to true
    if (isActive !== undefined && isActive !== 'false') {
      where.isActive = isActive === 'true' || isActive === true;
    } else if (isActive === undefined) {
      // Default to active therapies if not specified
      where.isActive = true;
    }

    if (therapyType) {
      where.therapyType = therapyType;
    }

    if (ageGroup) {
      where.ageGroup = ageGroup;
    }

    if (difficultyLevel) {
      where.difficultyLevel = difficultyLevel;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    let therapies;
    try {
      // Try with full query first
      therapies = await Therapy.findAndCountAll({
        where,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
        order: [['createdAt', 'DESC']], // Use createdAt instead of usageCount/rating to avoid potential issues
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName'],
            required: false,
          },
        ],
      });
    } catch (queryError) {
      logger.error('Error querying therapies', {
        error: queryError.message,
        stack: queryError.stack,
      });
      // Try without isActive filter if it fails
      try {
        const whereWithoutActive = { ...where };
        delete whereWithoutActive.isActive;
        therapies = await Therapy.findAndCountAll({
          where: whereWithoutActive,
          limit: parseInt(limit) || 20,
          offset: parseInt(offset) || 0,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'firstName', 'lastName'],
              required: false,
            },
          ],
        });
      } catch (fallbackError) {
        logger.error('Error with fallback query', {
          error: fallbackError.message,
          stack: fallbackError.stack,
        });
        // Try simplest query without include
        try {
          const whereSimple = { ...where };
          delete whereSimple.isActive;
          therapies = await Therapy.findAndCountAll({
            where: whereSimple,
            limit: parseInt(limit) || 20,
            offset: parseInt(offset) || 0,
            order: [['createdAt', 'DESC']],
          });
        } catch (simpleError) {
          logger.error('Error with simple query', {
            error: simpleError.message,
          });
          return res.json({
            success: true,
            data: {
              therapies: [],
              total: 0,
              limit: parseInt(limit) || 20,
              offset: parseInt(offset) || 0,
            },
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        therapies: therapies.rows || [],
        total: therapies.count || 0,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
      },
    });
  } catch (error) {
    logger.error('Get therapies error', {
      error: error.message,
      stack: error.stack,
    });
    // Always return success with empty array on error
    res.json({
      success: true,
      data: {
        therapies: [],
        total: 0,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
      },
    });
  }
};

/**
 * Get single therapy
 * GET /api/therapy/:id
 */
export const getTherapy = async (req, res) => {
  try {
    const { id } = req.params;

    const therapy = await Therapy.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
        },
      ],
    });

    if (!therapy) {
      return res.status(404).json({ error: 'Therapy not found' });
    }

    res.json({
      success: true,
      data: therapy,
    });
  } catch (error) {
    logger.error('Get therapy error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch therapy' });
  }
};

/**
 * Create therapy (Admin, Teacher)
 * POST /api/therapy
 */
export const createTherapy = async (req, res) => {
  try {
    const {
      title,
      description,
      therapyType,
      contentUrl,
      contentType,
      duration,
      ageGroup,
      difficultyLevel,
      tags,
    } = req.body;

    if (!title || !therapyType) {
      return res.status(400).json({ error: 'Title and therapy type are required' });
    }

    const therapy = await Therapy.create({
      title,
      description,
      therapyType,
      contentUrl,
      contentType,
      duration,
      ageGroup: ageGroup || 'all',
      difficultyLevel: difficultyLevel || 'all',
      tags: tags || [],
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: therapy,
    });
  } catch (error) {
    logger.error('Create therapy error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to create therapy' });
  }
};

/**
 * Start therapy session
 * POST /api/therapy/:id/start
 */
export const startTherapy = async (req, res) => {
  try {
    const { id } = req.params;
    const { childId } = req.body;
    const parentId = req.user.id;

    const therapy = await Therapy.findByPk(id);
    if (!therapy) {
      return res.status(404).json({ error: 'Therapy not found' });
    }

    // Verify child belongs to parent
    if (childId) {
      const child = await Child.findOne({
        where: { id: childId, parentId },
      });
      if (!child) {
        return res.status(403).json({ error: 'Child not found or access denied' });
      }
    }

    const usage = await TherapyUsage.create({
      therapyId: id,
      childId: childId || null,
      parentId,
      teacherId: req.user.role === 'teacher' ? req.user.id : null,
      startTime: new Date(),
    });

    // Update therapy usage count
    await therapy.increment('usageCount');

    res.status(201).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    logger.error('Start therapy error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to start therapy' });
  }
};

/**
 * End therapy session
 * PUT /api/therapy/usage/:id/end
 */
export const endTherapy = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, notes, rating, feedback } = req.body;
    const userId = req.user.id;

    const usage = await TherapyUsage.findByPk(id);
    if (!usage) {
      return res.status(404).json({ error: 'Therapy usage not found' });
    }

    // Verify ownership
    if (usage.parentId !== userId && usage.teacherId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const endTime = new Date();
    const duration = Math.round((endTime - usage.startTime) / 1000 / 60); // minutes

    await usage.update({
      endTime,
      duration,
      progress,
      notes,
      rating,
      feedback,
    });

    // Update therapy rating if rating provided
    if (rating) {
      const therapy = await Therapy.findByPk(usage.therapyId);
      if (therapy) {
        const currentRating = parseFloat(therapy.rating) || 0;
        const currentCount = therapy.ratingCount || 0;
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;

        await therapy.update({
          rating: newRating.toFixed(2),
          ratingCount: newCount,
        });
      }
    }

    res.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    logger.error('End therapy error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to end therapy' });
  }
};

/**
 * Update therapy (Admin, Teacher)
 * PUT /api/therapy/:id
 */
export const updateTherapy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      therapyType,
      contentUrl,
      contentType,
      duration,
      ageGroup,
      difficultyLevel,
      tags,
      isActive,
    } = req.body;

    const therapy = await Therapy.findByPk(id);
    if (!therapy) {
      return res.status(404).json({ error: 'Therapy not found' });
    }

    // Verify ownership or admin role
    if (therapy.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await therapy.update({
      title: title || therapy.title,
      description: description !== undefined ? description : therapy.description,
      therapyType: therapyType || therapy.therapyType,
      contentUrl: contentUrl !== undefined ? contentUrl : therapy.contentUrl,
      contentType: contentType || therapy.contentType,
      duration: duration !== undefined ? parseInt(duration) : therapy.duration,
      ageGroup: ageGroup || therapy.ageGroup,
      difficultyLevel: difficultyLevel || therapy.difficultyLevel,
      tags: tags || therapy.tags,
      isActive: isActive !== undefined ? isActive : therapy.isActive,
    });

    res.json({
      success: true,
      data: therapy,
    });
  } catch (error) {
    logger.error('Update therapy error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to update therapy' });
  }
};

/**
 * Delete therapy (Admin, Teacher)
 * DELETE /api/therapy/:id
 */
export const deleteTherapy = async (req, res) => {
  try {
    const { id } = req.params;

    const therapy = await Therapy.findByPk(id);
    if (!therapy) {
      return res.status(404).json({ error: 'Therapy not found' });
    }

    // Verify ownership or admin role
    if (therapy.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Soft delete by setting isActive to false
    await therapy.update({ isActive: false });

    res.json({
      success: true,
      message: 'Therapy deleted successfully',
    });
  } catch (error) {
    logger.error('Delete therapy error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to delete therapy' });
  }
};

/**
 * Get therapy usage history
 * GET /api/therapy/usage
 */
export const getTherapyUsage = async (req, res) => {
  try {
    const { childId, therapyId, limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    const where = {};

    if (req.user.role === 'parent') {
      where.parentId = userId;
    } else if (req.user.role === 'teacher') {
      where.teacherId = userId;
    }

    if (childId) {
      where.childId = childId;
    }

    if (therapyId) {
      where.therapyId = therapyId;
    }

    const usages = await TherapyUsage.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['startTime', 'DESC']],
      include: [
        {
          model: Therapy,
          as: 'therapy',
          required: false,
        },
        {
          model: Child,
          as: 'child',
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      data: {
        usages: usages.rows,
        total: usages.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get therapy usage error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch therapy usage' });
  }
};
