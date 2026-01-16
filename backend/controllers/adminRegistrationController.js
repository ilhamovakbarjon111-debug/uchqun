import AdminRegistrationRequest from '../models/AdminRegistrationRequest.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

/**
 * Submit admin registration request
 * POST /api/auth/admin-register
 * Public endpoint - no authentication required
 */
export const submitRegistrationRequest = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      passportNumber,
      passportSeries,
      location,
      region,
      city,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !passportNumber || !location) {
      return res.status(400).json({
        error: 'First name, last name, email, passport number, and location are required',
      });
    }

    // Check if email already exists in users table
    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered',
      });
    }

    // Check if there's already a pending request with this email
    const existingRequest = await AdminRegistrationRequest.findOne({
      where: {
        email: email.toLowerCase().trim(),
        status: { [Op.in]: ['pending', 'approved'] },
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        error: 'Registration request already exists for this email',
      });
    }

    // Create registration request
    const request = await AdminRegistrationRequest.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      passportNumber: passportNumber.trim(),
      passportSeries: passportSeries?.trim() || null,
      location: location.trim(),
      region: region?.trim() || null,
      city: city?.trim() || null,
      status: 'pending',
    });

    logger.info('Admin registration request submitted', {
      requestId: request.id,
      email: request.email,
    });

    res.status(201).json({
      success: true,
      message: 'Registration request submitted successfully. Please wait for super-admin approval.',
      data: request.toJSON(),
    });
  } catch (error) {
    logger.error('Submit admin registration request error', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: 'Failed to submit registration request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all admin registration requests (for super-admin)
 * GET /api/super-admin/admin-registrations
 * Requires super-admin authentication
 */
export const getRegistrationRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) {
      where.status = status;
    }

    const { count, rows: requests } = await AdminRegistrationRequest.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: requests.map(r => r.toJSON()),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get registration requests error', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Failed to fetch registration requests' });
  }
};

/**
 * Get single registration request by ID
 * GET /api/super-admin/admin-registrations/:id
 */
export const getRegistrationRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await AdminRegistrationRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
        {
          model: User,
          as: 'approvedUser',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
      ],
    });

    if (!request) {
      return res.status(404).json({ error: 'Registration request not found' });
    }

    res.json({
      success: true,
      data: request.toJSON(),
    });
  } catch (error) {
    logger.error('Get registration request by id error', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Failed to fetch registration request' });
  }
};

/**
 * Approve admin registration request
 * POST /api/super-admin/admin-registrations/:id/approve
 * Requires super-admin authentication
 * 
 * Creates the admin user account after approval
 */
export const approveRegistrationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required to create admin account',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    // Find the request
    const request = await AdminRegistrationRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: 'Registration request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: `Request is already ${request.status}`,
      });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered',
      });
    }

    // Create admin user account
    const adminUser = await User.create({
      email: email.toLowerCase().trim(),
      password: password, // Will be hashed by User model hook
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      role: 'admin',
      isVerified: true,
      documentsApproved: true,
      isActive: true,
    });

    // Update request status
    request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.approvedUserId = adminUser.id;
    await request.save();

    logger.info('Admin registration request approved', {
      requestId: id,
      adminUserId: adminUser.id,
      reviewedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Registration request approved and admin account created',
      data: {
        request: request.toJSON(),
        admin: adminUser.toJSON(),
      },
    });
  } catch (error) {
    logger.error('Approve registration request error', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: 'Failed to approve registration request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Reject admin registration request
 * POST /api/super-admin/admin-registrations/:id/reject
 * Requires super-admin authentication
 */
export const rejectRegistrationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const request = await AdminRegistrationRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: 'Registration request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: `Request is already ${request.status}`,
      });
    }

    // Update request status
    request.status = 'rejected';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.rejectionReason = reason?.trim() || null;
    await request.save();

    logger.info('Admin registration request rejected', {
      requestId: id,
      reviewedBy: req.user.id,
      reason: reason,
    });

    res.json({
      success: true,
      message: 'Registration request rejected',
      data: request.toJSON(),
    });
  } catch (error) {
    logger.error('Reject registration request error', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: 'Failed to reject registration request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
