import { Op, fn, col } from 'sequelize';
import User from '../models/User.js';
import Document from '../models/Document.js';
import ParentActivity from '../models/ParentActivity.js';
import ParentMeal from '../models/ParentMeal.js';
import ParentMedia from '../models/ParentMedia.js';
import Child from '../models/Child.js';
import Group from '../models/Group.js';
import School from '../models/School.js';
import SchoolRating from '../models/SchoolRating.js';
import logger from '../utils/logger.js';

/**
 * Admin Controller
 * Handles Admin-specific operations:
 * - View Reception accounts pending verification
 * - View uploaded documents from Reception
 * - Approve/reject Reception documents
 * - Activate Reception accounts after approval
 */

/**
 * Get all Reception accounts with their verification status
 * GET /api/admin/receptions
 * 
 * Business Logic:
 * - Admin can view all Reception accounts
 * - Shows document upload status and approval status
 */
export const getReceptions = async (req, res) => {
  try {
    const receptions = await User.findAll({
      where: { role: 'reception', createdBy: req.user.id },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Document,
          as: 'documents',
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: receptions,
    });
  } catch (error) {
    logger.error('Get receptions error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch reception accounts' });
  }
};

/**
 * Get a specific Reception account with documents
 * GET /api/admin/receptions/:id
 */
export const getReceptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const reception = await User.findOne({
      where: { id, role: 'reception', createdBy: req.user.id },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Document,
          as: 'documents',
          required: false,
        },
      ],
    });

    if (!reception) {
      return res.status(404).json({ error: 'Reception account not found' });
    }

    res.json({
      success: true,
      data: reception,
    });
  } catch (error) {
    logger.error('Get reception by id error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch reception account' });
  }
};

/**
 * Get all documents pending review
 * GET /api/admin/documents/pending
 */
export const getPendingDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
          where: { createdBy: req.user.id },
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    logger.error('Get pending documents error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch pending documents' });
  }
};

/**
 * Get all documents for a specific Reception account
 * GET /api/admin/receptions/:id/documents
 */
export const getReceptionDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the user is a Reception account
    const reception = await User.findOne({
      where: { id, role: 'reception', createdBy: req.user.id },
    });

    if (!reception) {
      return res.status(404).json({ error: 'Reception account not found' });
    }

    const documents = await Document.findAll({
      where: { userId: id },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    logger.error('Get reception documents error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

/**
 * Approve a document
 * PUT /api/admin/documents/:id/approve
 * 
 * Business Logic:
 * - Admin approves a document
 * - If all required documents are approved, Reception account is activated
 */
export const approveDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Ensure this document belongs to a reception created by the current admin
    if (!document.user || document.user.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this document' });
    }

    if (document.status !== 'pending') {
      return res.status(400).json({ error: 'Document is not pending approval' });
    }

    // Update document status
    document.status = 'approved';
    document.reviewedBy = req.user.id;
    document.reviewedAt = new Date();
    await document.save();

    // Check if all documents for this Reception are approved
    const allDocuments = await Document.findAll({
      where: { userId: document.userId },
    });

    const allApproved = allDocuments.every(doc => doc.status === 'approved');
    const hasRequiredDocuments = allDocuments.length > 0;

    // If all documents are approved and there are documents, activate the Reception account
    if (allApproved && hasRequiredDocuments) {
      const reception = await User.findByPk(document.userId);
      if (reception) {
        reception.documentsApproved = true;
        reception.isActive = true;
        await reception.save();

        logger.info('Reception account activated', {
          receptionId: reception.id,
          email: reception.email,
          approvedBy: req.user.id,
        });
      }
    }

    // Reload document without reviewer details to avoid exposing other admin information
    const documentResponse = await Document.findByPk(document.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
        },
      ],
      attributes: { exclude: [] }, // Exclude password if any
    });

    res.json({
      success: true,
      message: 'Document approved successfully',
      data: documentResponse,
    });
  } catch (error) {
    logger.error('Approve document error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to approve document' });
  }
};

/**
 * Reject a document
 * PUT /api/admin/documents/:id/reject
 */
export const rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Ensure this document belongs to a reception created by the current admin
    const docOwner = await User.findByPk(document.userId);
    if (!docOwner || docOwner.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this document' });
    }

    if (document.status !== 'pending') {
      return res.status(400).json({ error: 'Document is not pending approval' });
    }

    // Update document status
    document.status = 'rejected';
    document.reviewedBy = req.user.id;
    document.reviewedAt = new Date();
    document.rejectionReason = rejectionReason;
    await document.save();

    // Deactivate Reception account if document is rejected
    const reception = await User.findByPk(document.userId);
    if (reception) {
      reception.documentsApproved = false;
      reception.isActive = false;
      await reception.save();
    }

    // Reload document without reviewer details to avoid exposing other admin information
    const documentResponse = await Document.findByPk(document.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
        },
      ],
      attributes: { exclude: [] }, // Exclude password if any
    });

    res.json({
      success: true,
      message: 'Document rejected',
      data: documentResponse,
    });
  } catch (error) {
    logger.error('Reject document error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to reject document' });
  }
};

/**
 * Activate a Reception account manually
 * PUT /api/admin/receptions/:id/activate
 * 
 * Business Logic:
 * - Admin can manually activate a Reception account
 * - This allows Reception to log in even if documents aren't fully approved
 */
export const activateReception = async (req, res) => {
  try {
    const { id } = req.params;

    const reception = await User.findOne({
      where: { id, role: 'reception', createdBy: req.user.id },
    });

    if (!reception) {
      return res.status(404).json({ error: 'Reception account not found' });
    }

    reception.isActive = true;
    reception.documentsApproved = true;
    await reception.save();

    logger.info('Reception account manually activated', {
      receptionId: reception.id,
      email: reception.email,
      activatedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Reception account activated successfully',
      data: reception.toJSON(),
    });
  } catch (error) {
    logger.error('Activate reception error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to activate reception account' });
  }
};

/**
 * Deactivate a Reception account
 * PUT /api/admin/receptions/:id/deactivate
 */
export const deactivateReception = async (req, res) => {
  try {
    const { id } = req.params;

    const reception = await User.findOne({
      where: { id, role: 'reception', createdBy: req.user.id },
    });

    if (!reception) {
      return res.status(404).json({ error: 'Reception account not found' });
    }

    reception.isActive = false;
    await reception.save();

    logger.info('Reception account deactivated', {
      receptionId: reception.id,
      email: reception.email,
      deactivatedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Reception account deactivated successfully',
      data: reception.toJSON(),
    });
  } catch (error) {
    logger.error('Deactivate reception error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to deactivate reception account' });
  }
};

/**
 * Create a Reception account
 * POST /api/admin/receptions
 * 
 * Business Logic:
 * - Admin can create Reception accounts
 * - Reception must upload documents after creation
 * - Reception cannot log in until documents are approved
 */
export const createReception = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, password, first name, and last name are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const reception = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone,
      role: 'reception',
      isVerified: false,
      documentsApproved: false,
      isActive: false, // Reception cannot log in until documents are approved
      createdBy: req.user.id,
    });

    logger.info('Reception account created by Admin', {
      receptionId: reception.id,
      email: reception.email,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Reception account created successfully',
      data: reception.toJSON(),
    });
  } catch (error) {
    logger.error('Create reception error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to create reception account' });
  }
};

/**
 * Update a Reception account
 * PUT /api/admin/receptions/:id
 * 
 * Business Logic:
 * - Admin can edit Reception account details
 */
export const updateReception = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, phone, password } = req.body;

    const reception = await User.findOne({
      where: { id, role: 'reception' },
    });

    if (!reception) {
      return res.status(404).json({ error: 'Reception account not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email.toLowerCase() !== reception.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email: email.toLowerCase(),
          id: { [require('sequelize').Op.ne]: id }
        } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      reception.email = email.toLowerCase();
    }

    if (firstName) reception.firstName = firstName;
    if (lastName) reception.lastName = lastName;
    if (phone !== undefined) reception.phone = phone;
    if (password) reception.password = password; // Will be hashed by model hook

    await reception.save();

    logger.info('Reception account updated by Admin', {
      receptionId: reception.id,
      updatedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Reception account updated successfully',
      data: reception.toJSON(),
    });
  } catch (error) {
    logger.error('Update reception error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to update reception account' });
  }
};

/**
 * Delete a Reception account
 * DELETE /api/admin/receptions/:id
 * 
 * Business Logic:
 * - Admin can delete Reception accounts
 */
export const deleteReception = async (req, res) => {
  try {
    const { id } = req.params;

    const reception = await User.findOne({
      where: { id, role: 'reception' },
    });

    if (!reception) {
      return res.status(404).json({ error: 'Reception account not found' });
    }

    await reception.destroy();

    logger.info('Reception account deleted by Admin', {
      receptionId: id,
      deletedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Reception account deleted successfully',
    });
  } catch (error) {
    logger.error('Delete reception error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to delete reception account' });
  }
};

/**
 * Get all Teachers (read-only for Admin)
 * GET /api/admin/teachers
 * 
 * Business Logic:
 * - Admin can only view teachers, cannot create/edit/delete
 * - Admin can view teachers created by receptions they created
 */
export const getTeachers = async (req, res) => {
  try {
    // First, get all receptions created by this admin
    const receptions = await User.findAll({
      where: { role: 'reception', createdBy: req.user.id },
      attributes: ['id'],
    });

    const receptionIds = receptions.map(r => r.id);

    logger.info('Admin getTeachers', {
      adminId: req.user.id,
      receptionsFound: receptions.length,
      receptionIds: receptionIds,
    });

    // If admin has no receptions, return empty array
    if (receptionIds.length === 0) {
      logger.info('Admin has no receptions, returning empty teachers list');
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get teachers created by these receptions
    const teachers = await User.findAll({
      where: { 
        role: 'teacher',
        createdBy: { [Op.in]: receptionIds }
      },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    logger.info('Teachers found', {
      count: teachers.length,
      teacherIds: teachers.map(t => t.id),
    });

    res.json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    logger.error('Get teachers error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};

/**
 * Get all Parents (read-only for Admin)
 * GET /api/admin/parents
 * 
 * Business Logic:
 * - Admin can only view parents, cannot create/edit/delete
 * - Admin can view parents created by receptions they created
 */
export const getParents = async (req, res) => {
  try {
    // First, get all receptions created by this admin
    const receptions = await User.findAll({
      where: { role: 'reception', createdBy: req.user.id },
      attributes: ['id'],
    });

    const receptionIds = receptions.map(r => r.id);

    logger.info('Admin getParents', {
      adminId: req.user.id,
      receptionsFound: receptions.length,
      receptionIds: receptionIds,
    });

    // If admin has no receptions, return empty array
    if (receptionIds.length === 0) {
      logger.info('Admin has no receptions, returning empty parents list');
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get parents created by these receptions
    const parents = await User.findAll({
      where: { 
        role: 'parent',
        createdBy: { [Op.in]: receptionIds }
      },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    logger.info('Parents found', {
      count: parents.length,
      parentRoles: parents.map(p => ({ id: p.id, role: p.role, email: p.email })),
    });

    // Double-check: filter out any non-parent roles (safety check)
    const filteredParents = parents.filter(p => p.role === 'parent');

    res.json({
      success: true,
      data: filteredParents,
    });
  } catch (error) {
    logger.error('Get parents error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch parents' });
  }
};

/**
 * Get all Admin accounts (Super Admin view)
 * GET /api/super-admin/admins
 */
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    logger.error('Get admins error', { error: error.message, stack: error.stack, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to fetch admin accounts' });
  }
};

/**
 * Update an Admin account (Super Admin only)
 * PUT /api/super-admin/admins/:id
 */
export const updateAdminBySuper = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, password } = req.body;

    const admin = await User.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (email && email.toLowerCase() !== admin.email) {
      const existing = await User.findOne({ where: { email: email.toLowerCase() } });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      admin.email = email.toLowerCase();
    }

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (phone !== undefined) admin.phone = phone;
    if (password) admin.password = password; // hashed by model hook

    await admin.save();

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: admin.toJSON(),
    });
  } catch (error) {
    logger.error('Update admin error', { error: error.message, stack: error.stack, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to update admin account' });
  }
};

/**
 * Delete an Admin account (Super Admin only)
 * DELETE /api/super-admin/admins/:id
 */
export const deleteAdminBySuper = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Prevent deleting self
    if (req.user?.id === admin.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Check if this admin has created other users (receptions/teachers/parents/admins)
    const dependentUsers = await User.count({ where: { createdBy: id } });
    if (dependentUsers > 0) {
      return res.status(409).json({ error: 'Cannot delete admin with dependent users. Please reassign or delete dependent accounts first.' });
    }

    await admin.destroy();

    res.json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    logger.error('Delete admin error', { error: error.message, stack: error.stack, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to delete admin account' });
  }
};

/**
 * Get a specific Parent with their data (read-only for Admin)
 * GET /api/admin/parents/:id
 */
export const getParentById = async (req, res) => {
  try {
    const { id } = req.params;

    // First, get all receptions created by this admin
    const receptions = await User.findAll({
      where: { role: 'reception', createdBy: req.user.id },
      attributes: ['id'],
    });

    const receptionIds = receptions.map(r => r.id);

    const parent = await User.findOne({
      where: { 
        id, 
        role: 'parent',
        createdBy: { [Op.in]: receptionIds }
      },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Child,
          as: 'children',
          required: false,
        },
      ],
    });

    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Get parent's activities, meals, and media
    const [activities, meals, media] = await Promise.all([
      ParentActivity.findAll({
        where: { parentId: id },
        order: [['activityDate', 'DESC']],
        limit: 10,
      }),
      ParentMeal.findAll({
        where: { parentId: id },
        order: [['mealDate', 'DESC']],
        limit: 10,
      }),
      ParentMedia.findAll({
        where: { parentId: id },
        order: [['uploadDate', 'DESC']],
        limit: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        parent: parent.toJSON(),
        children: parent.children || [],
        activities,
        meals,
        media,
      },
    });
  } catch (error) {
    logger.error('Get parent by id error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch parent' });
  }
};

/**
 * Get dashboard statistics for Admin
 * GET /api/admin/statistics
 * 
 * Business Logic:
 * - Admin can view all system statistics
 */
export const getStatistics = async (req, res) => {
  try {
    logger.info('Getting statistics for admin', { adminId: req.user.id });

    // Get counts for all roles
    // First get reception IDs created by this admin
    const adminReceptions = await User.findAll({
      where: { role: 'reception', createdBy: req.user.id },
      attributes: ['id'],
    });
    const receptionIds = adminReceptions.map(r => r.id);

    // Get teachers created by these receptions
    let teacherIds = [];
    if (receptionIds.length > 0) {
      const adminTeachers = await User.findAll({
        where: { 
          role: 'teacher', 
          createdBy: { [Op.in]: receptionIds },
        },
        attributes: ['id'],
      });
      teacherIds = adminTeachers.map(t => t.id);
    }

    const [receptions, teachers, parents, groups] = await Promise.all([
      User.count({ where: { role: 'reception', createdBy: req.user.id } }),
      receptionIds.length > 0 
        ? User.count({ where: { role: 'teacher', createdBy: { [Op.in]: receptionIds } } })
        : Promise.resolve(0),
      receptionIds.length > 0
        ? User.count({ where: { role: 'parent', createdBy: { [Op.in]: receptionIds } } })
        : Promise.resolve(0),
      teacherIds.length > 0
        ? Group.count({ where: { teacherId: { [Op.in]: teacherIds } } })
        : Promise.resolve(0),
    ]);

    // Get active vs inactive receptions
    const [activeReceptions, inactiveReceptions, pendingReceptions] = await Promise.all([
      User.count({ 
        where: { 
          role: 'reception',
          createdBy: req.user.id,
          isActive: true,
          documentsApproved: true,
        } 
      }),
      User.count({ 
        where: { 
          role: 'reception',
          createdBy: req.user.id,
          isActive: false,
        } 
      }),
      User.count({ 
        where: { 
          role: 'reception',
          createdBy: req.user.id,
          documentsApproved: false,
        } 
      }),
    ]);

    // Get document statistics

    const [pendingDocuments, approvedDocuments, rejectedDocuments] = await Promise.all([
      receptionIds.length > 0
        ? Document.count({ where: { status: 'pending', userId: { [Op.in]: receptionIds } } })
        : Promise.resolve(0),
      receptionIds.length > 0
        ? Document.count({ where: { status: 'approved', userId: { [Op.in]: receptionIds } } })
        : Promise.resolve(0),
      receptionIds.length > 0
        ? Document.count({ where: { status: 'rejected', userId: { [Op.in]: receptionIds } } })
        : Promise.resolve(0),
    ]);

    // Get parent data statistics (only for parents created by admin's receptions)
    // Get parent IDs created by admin's receptions
    const adminParents = await User.findAll({
      where: { 
        role: 'parent', 
        createdBy: receptionIds.length > 0 ? { [Op.in]: receptionIds } : null,
      },
      attributes: ['id'],
    });
    const parentIds = adminParents.map(p => p.id);

    const [totalActivities, totalMeals, totalMedia] = await Promise.all([
      parentIds.length > 0
        ? ParentActivity.count({ where: { parentId: { [Op.in]: parentIds } } })
        : Promise.resolve(0),
      parentIds.length > 0
        ? ParentMeal.count({ where: { parentId: { [Op.in]: parentIds } } })
        : Promise.resolve(0),
      parentIds.length > 0
        ? ParentMedia.count({ where: { parentId: { [Op.in]: parentIds } } })
        : Promise.resolve(0),
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentReceptions, recentParents, recentTeachers] = await Promise.all([
      User.count({
        where: {
          role: 'reception',
          createdBy: req.user.id,
          createdAt: { [Op.gte]: thirtyDaysAgo },
        },
      }),
      User.count({
        where: {
          role: 'parent',
          createdBy: receptionIds.length > 0 ? { [Op.in]: receptionIds } : null,
          createdAt: { [Op.gte]: thirtyDaysAgo },
        },
      }),
      User.count({
        where: {
          role: 'teacher',
          createdBy: receptionIds.length > 0 ? { [Op.in]: receptionIds } : null,
          createdAt: { [Op.gte]: thirtyDaysAgo },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        users: {
          receptions,
          teachers,
          parents,
          total: receptions + teachers + parents,
        },
        receptions: {
          total: receptions,
          active: activeReceptions,
          inactive: inactiveReceptions,
          pending: pendingReceptions,
        },
        documents: {
          pending: pendingDocuments,
          approved: approvedDocuments,
          rejected: rejectedDocuments,
          total: pendingDocuments + approvedDocuments + rejectedDocuments,
        },
        content: {
          activities: totalActivities,
          meals: totalMeals,
          media: totalMedia,
          total: totalActivities + totalMeals + totalMedia,
        },
        groups: {
          total: groups,
        },
        recentActivity: {
          receptions: recentReceptions,
          parents: recentParents,
          teachers: recentTeachers,
        },
      },
    });
  } catch (error) {
    logger.error('Get statistics error', { 
      error: error.message, 
      stack: error.stack,
      adminId: req.user?.id 
    });
    console.error('Statistics error details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create an Admin account
 * POST /api/admin/admins
 * 
 * Business Logic:
 * - Super admin can create Admin accounts
 * - If role is 'superAdmin', can be created without token
 * - Only email and password are required
 * - firstName and lastName are set to default values
 */
/**
 * Get school ratings (only for schools where parents created by admin's receptions are enrolled)
 * GET /api/admin/school-ratings
 */
export const getSchoolRatings = async (req, res) => {
  try {
    // Get receptions created by this admin
    const receptions = await User.findAll({
      where: { role: 'reception', createdBy: req.user.id },
      attributes: ['id'],
    });

    const receptionIds = receptions.map(r => r.id);
    if (receptionIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Get parents created by these receptions
    const parents = await User.findAll({
      where: { role: 'parent', createdBy: { [Op.in]: receptionIds } },
      attributes: ['id'],
    });

    const parentIds = parents.map(p => p.id);
    if (parentIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Get school ratings from these parents
    const ratings = await SchoolRating.findAll({
      where: { parentId: { [Op.in]: parentIds } },
      include: [
        {
          model: School,
          as: 'school',
          attributes: ['id', 'name', 'type', 'address'],
          required: true,
        },
        {
          model: User,
          as: 'ratingParent',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
      ],
      order: [['updatedAt', 'DESC']],
    });

    // Group by school and calculate averages
    const schoolMap = new Map();
    ratings.forEach((rating) => {
      const schoolId = rating.schoolId;
      if (!schoolMap.has(schoolId)) {
        schoolMap.set(schoolId, {
          school: rating.school.toJSON(),
          ratings: [],
          average: 0,
          count: 0,
        });
      }
      const schoolData = schoolMap.get(schoolId);
      schoolData.ratings.push({
        ...rating.toJSON(),
        parentName: rating.ratingParent
          ? `${rating.ratingParent.firstName || ''} ${rating.ratingParent.lastName || ''}`.trim()
          : null,
        parentEmail: rating.ratingParent?.email || null,
      });
    });

    // Calculate averages
    const result = Array.from(schoolMap.values()).map((schoolData) => {
      const stars = schoolData.ratings.map(r => r.stars);
      const average = stars.length > 0
        ? (stars.reduce((sum, s) => sum + s, 0) / stars.length).toFixed(1)
        : 0;
      return {
        ...schoolData,
        average: parseFloat(average),
        count: stars.length,
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get school ratings error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch school ratings' });
  }
};

/**
 * Get all schools with average ratings (Super Admin view)
 * GET /api/super-admin/schools
 */
export const getAllSchools = async (req, res) => {
  try {
    const schools = await School.findAll({
      where: { isActive: true },
      include: [
        {
          model: SchoolRating,
          as: 'ratings',
          attributes: ['stars'],
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });

    // Calculate average ratings for each school
    const schoolsWithRatings = schools.map((school) => {
      const ratings = school.ratings || [];
      const stars = ratings.map(r => r.stars);
      const average = stars.length > 0
        ? (stars.reduce((sum, s) => sum + s, 0) / stars.length).toFixed(1)
        : 0;
      const count = stars.length;

      return {
        ...school.toJSON(),
        summary: {
          average: parseFloat(average),
          count,
        },
      };
    });

    res.json({
      success: true,
      data: schoolsWithRatings,
    });
  } catch (error) {
    logger.error('Get all schools error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        error: 'First name, last name, email and password are required' 
      });
    }

    // If role is 'superAdmin', allow creation without authentication
    const isSuperAdmin = role === 'superAdmin';
    
    // For regular admin creation, require authentication
    if (!isSuperAdmin && !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create admin with provided firstName and lastName
    // If role is 'superAdmin', create as 'admin' role (since User model only has 'admin' role)
    const admin = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role: 'admin', // User model only supports 'admin', 'reception', 'teacher', 'parent'
    });

    logger.info('Admin account created', {
      adminId: admin.id,
      email: admin.email,
      isSuperAdmin,
      createdBy: req.user?.id || (isSuperAdmin ? 'direct-creation' : 'unknown'),
    });

    res.status(201).json({
      success: true,
      message: isSuperAdmin ? 'Super admin account created successfully' : 'Admin account created successfully',
      data: admin.toJSON(),
    });
  } catch (error) {
    logger.error('Create admin error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to create admin account' });
  }
};

