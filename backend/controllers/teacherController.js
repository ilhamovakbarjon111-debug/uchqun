import User from '../models/User.js';
import Child from '../models/Child.js';
import TeacherResponsibility from '../models/TeacherResponsibility.js';
import TeacherTask from '../models/TeacherTask.js';
import TeacherWorkHistory from '../models/TeacherWorkHistory.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

/**
 * Teacher Controller
 * Handles Teacher-specific operations:
 * - View assigned responsibilities
 * - View tasks performed
 * - View deadlines and work history
 * - View parent accounts (read-only)
 */

/**
 * Get teacher profile with all data
 * GET /api/teacher/profile
 * 
 * Business Logic:
 * - Teacher profile must display:
 *   - Assigned responsibilities
 *   - Tasks performed
 *   - Deadlines and work history
 */
export const getMyProfile = async (req, res) => {
  try {
    const teacher = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    const [responsibilities, tasks, workHistory] = await Promise.all([
      TeacherResponsibility.findAll({
        where: { teacherId: req.user.id },
        order: [['assignedDate', 'DESC']],
      }),
      TeacherTask.findAll({
        where: { teacherId: req.user.id },
        order: [['taskDate', 'DESC']],
      }),
      TeacherWorkHistory.findAll({
        where: { teacherId: req.user.id },
        order: [['workDate', 'DESC']],
      }),
    ]);

    res.json({
      success: true,
      data: {
        teacher: teacher.toJSON(),
        responsibilities,
        tasks,
        workHistory,
      },
    });
  } catch (error) {
    logger.error('Get teacher profile error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch teacher profile' });
  }
};

/**
 * Get assigned responsibilities
 * GET /api/teacher/responsibilities
 */
export const getMyResponsibilities = async (req, res) => {
  try {
    const { status, priority } = req.query;

    const where = { teacherId: req.user.id };
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }

    const responsibilities = await TeacherResponsibility.findAll({
      where,
      order: [['assignedDate', 'DESC']],
    });

    res.json({
      success: true,
      data: responsibilities,
    });
  } catch (error) {
    logger.error('Get responsibilities error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch responsibilities' });
  }
};

/**
 * Get a specific responsibility
 * GET /api/teacher/responsibilities/:id
 */
export const getResponsibilityById = async (req, res) => {
  try {
    const { id } = req.params;

    const responsibility = await TeacherResponsibility.findOne({
      where: { id, teacherId: req.user.id },
    });

    if (!responsibility) {
      return res.status(404).json({ error: 'Responsibility not found' });
    }

    res.json({
      success: true,
      data: responsibility,
    });
  } catch (error) {
    logger.error('Get responsibility by id error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch responsibility' });
  }
};

/**
 * Get tasks performed
 * GET /api/teacher/tasks
 */
export const getMyTasks = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    const where = { teacherId: req.user.id };
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.taskDate = {};
      if (startDate) where.taskDate[Op.gte] = new Date(startDate);
      if (endDate) where.taskDate[Op.lte] = new Date(endDate);
    }

    const tasks = await TeacherTask.findAll({
      where,
      order: [['taskDate', 'DESC']],
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    logger.error('Get tasks error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

/**
 * Get a specific task
 * GET /api/teacher/tasks/:id
 */
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await TeacherTask.findOne({
      where: { id, teacherId: req.user.id },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    logger.error('Get task by id error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

/**
 * Update task status
 * PUT /api/teacher/tasks/:id/status
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const task = await TeacherTask.findOne({
      where: { id, teacherId: req.user.id },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = status;
    if (notes) task.notes = notes;
    if (status === 'completed') {
      task.completedAt = new Date();
    }
    await task.save();

    logger.info('Task status updated', {
      taskId: task.id,
      teacherId: req.user.id,
      status,
    });

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task,
    });
  } catch (error) {
    logger.error('Update task status error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

/**
 * Get work history with deadlines
 * GET /api/teacher/work-history
 */
export const getMyWorkHistory = async (req, res) => {
  try {
    const { status, workType, startDate, endDate } = req.query;

    const where = { teacherId: req.user.id };
    
    if (status) {
      where.status = status;
    }
    
    if (workType) {
      where.workType = workType;
    }
    
    if (startDate || endDate) {
      where.workDate = {};
      if (startDate) where.workDate[Op.gte] = new Date(startDate);
      if (endDate) where.workDate[Op.lte] = new Date(endDate);
    }

    const workHistory = await TeacherWorkHistory.findAll({
      where,
      order: [['workDate', 'DESC']],
    });

    // Separate items by deadline status
    const now = new Date();
    const upcoming = workHistory.filter(item => 
      item.deadline && new Date(item.deadline) > now && item.status !== 'completed'
    );
    const overdue = workHistory.filter(item => 
      item.deadline && new Date(item.deadline) < now && item.status !== 'completed'
    );
    const completed = workHistory.filter(item => item.status === 'completed');

    res.json({
      success: true,
      data: workHistory,
      summary: {
        total: workHistory.length,
        upcoming: upcoming.length,
        overdue: overdue.length,
        completed: completed.length,
      },
    });
  } catch (error) {
    logger.error('Get work history error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch work history' });
  }
};

/**
 * Get a specific work history item
 * GET /api/teacher/work-history/:id
 */
export const getWorkHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const workHistory = await TeacherWorkHistory.findOne({
      where: { id, teacherId: req.user.id },
    });

    if (!workHistory) {
      return res.status(404).json({ error: 'Work history item not found' });
    }

    res.json({
      success: true,
      data: workHistory,
    });
  } catch (error) {
    logger.error('Get work history by id error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch work history item' });
  }
};

/**
 * Update work history status
 * PUT /api/teacher/work-history/:id/status
 */
export const updateWorkHistoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const workHistory = await TeacherWorkHistory.findOne({
      where: { id, teacherId: req.user.id },
    });

    if (!workHistory) {
      return res.status(404).json({ error: 'Work history item not found' });
    }

    workHistory.status = status;
    if (notes) workHistory.notes = notes;
    if (status === 'completed') {
      workHistory.completedAt = new Date();
    }
    await workHistory.save();

    logger.info('Work history status updated', {
      workHistoryId: workHistory.id,
      teacherId: req.user.id,
      status,
    });

    res.json({
      success: true,
      message: 'Work history status updated successfully',
      data: workHistory,
    });
  } catch (error) {
    logger.error('Update work history status error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to update work history status' });
  }
};

/**
 * Get dashboard summary
 * GET /api/teacher/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    const [responsibilitiesCount, tasksCount, workHistoryCount] = await Promise.all([
      TeacherResponsibility.count({
        where: { teacherId: req.user.id, status: 'active' },
      }),
      TeacherTask.count({
        where: { teacherId: req.user.id, status: { [Op.in]: ['pending', 'in_progress'] } },
      }),
      TeacherWorkHistory.count({
        where: { 
          teacherId: req.user.id, 
          status: { [Op.in]: ['pending', 'in_progress'] },
          deadline: { [Op.lte]: new Date() },
        },
      }),
    ]);

    const upcomingDeadlines = await TeacherWorkHistory.findAll({
      where: {
        teacherId: req.user.id,
        status: { [Op.in]: ['pending', 'in_progress'] },
        deadline: { [Op.gte]: new Date() },
      },
      order: [['deadline', 'ASC']],
      limit: 5,
    });

    res.json({
      success: true,
      data: {
        summary: {
          activeResponsibilities: responsibilitiesCount,
          pendingTasks: tasksCount,
          overdueWork: workHistoryCount,
        },
        upcomingDeadlines,
      },
    });
  } catch (error) {
    logger.error('Get dashboard error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

/**
 * Get all Parents
 * GET /api/teacher/parents
 */
export const getParents = async (req, res) => {
  try {
    const { search, limit = 100, offset = 0 } = req.query;

    const where = { role: 'parent' };
    
    // If user is a teacher, only show parents assigned to them
    if (req.user.role === 'teacher') {
      where.teacherId = req.user.id;
    }
    // Admin can see all parents
    
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: parents } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Child,
          as: 'children',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'disabilityType', 'school', 'class', 'teacher'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      parents: parents.map(p => p.toJSON()),
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    logger.error('Get parents error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch parents' });
  }
};

/**
 * Get a single parent by ID
 * GET /api/teacher/parents/:id
 */
export const getParentById = async (req, res) => {
  try {
    const { id } = req.params;

    const parent = await User.findOne({
      where: { id, role: 'parent' },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Child,
          as: 'children',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'disabilityType', 'school', 'class', 'teacher'],
          required: false,
        },
      ],
    });

    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    res.json({
      success: true,
      data: parent.toJSON(),
    });
  } catch (error) {
    logger.error('Get parent by id error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch parent' });
  }
};

