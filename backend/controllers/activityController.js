import { Op } from 'sequelize';
import Activity from '../models/Activity.js';
import Child from '../models/Child.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

export const getActivities = async (req, res) => {
  try {
    const { type, limit, offset, date, childId } = req.query;
    const limitNum = limit ? parseInt(limit) : undefined;
    const offsetNum = offset ? parseInt(offset) : 0;

    const where = {};
    
    // If user is teacher, show only activities for children of assigned parents
    if (req.user.role === 'teacher') {
      // Get all parents assigned to this teacher
      const assignedParents = await User.findAll({
        where: { teacherId: req.user.id },
        attributes: ['id'],
      });
      
      if (assignedParents.length === 0) {
        return res.json([]);
      }
      
      const parentIds = assignedParents.map(p => p.id);
      
      // Get all children of assigned parents
      const children = await Child.findAll({
        where: { parentId: { [Op.in]: parentIds } },
        attributes: ['id'],
      });
      
      if (children.length === 0) {
        return res.json([]);
      }
      
      const childIds = children.map(c => c.id);
      
      if (childId) {
        // If childId is specified, verify it belongs to assigned parents
        if (!childIds.includes(childId)) {
          return res.status(403).json({ error: 'Access denied to this child' });
        }
        where.childId = childId;
      } else {
        // Show activities for all assigned children
        where.childId = { [Op.in]: childIds };
      }
    } else if (req.user.role === 'admin') {
      // Admin can see all activities
      if (childId) {
        where.childId = childId;
      }
      // If no childId, show all activities
    } else {
      // For parents, show activities for all their children or filter by childId
      const children = await Child.findAll({
        where: { parentId: req.user.id },
        attributes: ['id'],
      });

      if (children.length === 0) {
        return res.json([]);
      }

      const childIds = children.map(c => c.id);
      
      if (childId) {
        // If childId is specified, verify it belongs to the parent
        if (!childIds.includes(childId)) {
          return res.status(403).json({ error: 'Access denied to this child' });
        }
        where.childId = childId;
      } else {
        // Show activities for all children
        where.childId = { [Op.in]: childIds };
      }
    }
    
    if (type) {
      where.type = type;
    }

    if (date) {
      where.date = date;
    }

    const activities = await Activity.findAll({
      where,
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: limitNum,
      offset: offsetNum,
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    res.json(Array.isArray(activities) ? activities : []);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
};

export const getActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const where = { id };
    
    // If user is teacher, only show activities for children of assigned parents
    if (req.user.role === 'teacher') {
      // Get all parents assigned to this teacher
      const assignedParents = await User.findAll({
        where: { teacherId: req.user.id },
        attributes: ['id'],
      });
      
      if (assignedParents.length === 0) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      
      const parentIds = assignedParents.map(p => p.id);
      
      // Get all children of assigned parents
      const children = await Child.findAll({
        where: { parentId: { [Op.in]: parentIds } },
        attributes: ['id'],
      });
      
      if (children.length === 0) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      
      const childIds = children.map(c => c.id);
      where.childId = { [Op.in]: childIds };
    } else if (req.user.role === 'admin') {
      // Admin can see all activities - no filter needed
    } else {
      const child = await Child.findOne({
        where: { parentId: req.user.id },
      });

      if (!child) {
        return res.status(404).json({ error: 'Child not found' });
      }
      where.childId = child.id;
    }

    const activity = await Activity.findOne({
      where,
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to get activity' });
  }
};

// Create activity (teachers only)
export const createActivity = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only teachers can create activities' });
    }

    const { 
      childId, teacher,
      skill, goal, startDate, endDate, tasks, methods, progress, observation
    } = req.body;

    if (!childId || !skill || !goal || !startDate || !endDate) {
      return res.status(400).json({ error: 'childId, skill, goal, startDate, and endDate are required' });
    }

    // Verify child exists
    const child = await Child.findByPk(childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Ensure tasks is an array
    const tasksArray = Array.isArray(tasks) ? tasks : (tasks ? [tasks] : []);

    const activity = await Activity.create({
      childId,
      // Use skill as title for backward compatibility
      title: skill || 'Individual Plan',
      description: goal || '',
      type: 'Learning',
      duration: 30,
      date: startDate || new Date().toISOString().split('T')[0],
      teacher: teacher || `${req.user.firstName} ${req.user.lastName}`,
      studentEngagement: 'Medium',
      notes: '',
      // Individual Plan fields
      skill: skill || null,
      goal: goal || null,
      startDate: startDate || null,
      endDate: endDate || null,
      tasks: tasksArray,
      methods: methods || null,
      progress: progress || null,
      observation: observation || null,
    });

    const createdActivity = await Activity.findByPk(activity.id, {
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    // Create notification for parent
    if (child.parentId) {
      await createNotification(
        child.parentId,
        childId,
        'activity',
        'Yangi aktivlik qo\'shildi',
        `${child.firstName} uchun "${title}" aktivligi qo'shildi`,
        activity.id,
        'activity'
      );
    }

    res.status(201).json(createdActivity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
};

// Update activity (teachers only)
export const updateActivity = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only teachers can update activities' });
    }

    const { id } = req.params;
    const activity = await Activity.findByPk(id);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    await activity.update(req.body);

    const updatedActivity = await Activity.findByPk(id, {
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    res.json(updatedActivity);
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
};

// Delete activity (teachers only)
export const deleteActivity = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only teachers can delete activities' });
    }

    const { id } = req.params;
    const activity = await Activity.findByPk(id);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    await activity.destroy();
    res.json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
};

