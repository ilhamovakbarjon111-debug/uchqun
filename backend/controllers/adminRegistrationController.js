import AdminRegistrationRequest from '../models/AdminRegistrationRequest.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';
import { uploadFile } from '../config/storage.js';
import fs from 'fs';
import { sendAdminApprovalEmail } from '../utils/email.js';

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
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        error: 'Ism, familiya, email va telefon raqami to\'ldirilishi shart',
      });
    }

    // Check if certificate or passport file is provided
    if (!req.files || (!req.files.certificateFile && !req.files.passportFile)) {
      return res.status(400).json({
        error: 'Kamida bitta hujjat (guvohnoma yoki passport/ID karta) yuklanishi kerak',
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

    // Upload files to storage
    let certificateFilePath = null;
    let passportFilePath = null;

    if (req.files.certificateFile && req.files.certificateFile[0]) {
      const certFile = req.files.certificateFile[0];
      const certBuffer = await fs.promises.readFile(certFile.path);
      const certUpload = await uploadFile(
        certBuffer,
        `admin-registration/certificate-${Date.now()}-${certFile.originalname}`,
        certFile.mimetype
      );
      certificateFilePath = certUpload.url || certUpload.path;
      // Clean up temp file
      await fs.promises.unlink(certFile.path).catch(() => {});
    }

    if (req.files.passportFile && req.files.passportFile[0]) {
      const passFile = req.files.passportFile[0];
      const passBuffer = await fs.promises.readFile(passFile.path);
      const passUpload = await uploadFile(
        passBuffer,
        `admin-registration/passport-${Date.now()}-${passFile.originalname}`,
        passFile.mimetype
      );
      passportFilePath = passUpload.url || passUpload.path;
      // Clean up temp file
      await fs.promises.unlink(passFile.path).catch(() => {});
    }

    // Create registration request
    const request = await AdminRegistrationRequest.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      certificateFile: certificateFilePath,
      passportFile: passportFilePath,
      passportNumber: passportNumber?.trim() || null,
      passportSeries: passportSeries?.trim() || null,
      location: location?.trim() || null,
      region: region?.trim() || null,
      city: city?.trim() || null,
      status: 'pending',
    });

    logger.info('Admin registration request submitted', {
      requestId: request.id,
      email: request.email,
      hasCertificate: !!certificateFilePath,
      hasPassport: !!passportFilePath,
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
    const { password } = req.body;

    // Generate password if not provided
    const generatedPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '123';

    if (generatedPassword.length < 6) {
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
      where: { email: request.email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered',
      });
    }

    // Create admin user account
    const adminUser = await User.create({
      email: request.email,
      password: generatedPassword, // Will be hashed by User model hook
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

    // Send email with login credentials
    try {
      await sendAdminApprovalEmail(request.email, generatedPassword, request.firstName);
      logger.info('Approval email sent', { email: request.email });
    } catch (emailError) {
      logger.error('Failed to send approval email', {
        error: emailError.message,
        email: request.email,
      });
      // Don't fail the request if email fails, but log it
    }

    logger.info('Admin registration request approved', {
      requestId: id,
      adminUserId: adminUser.id,
      reviewedBy: req.user.id,
      email: request.email,
    });

    res.json({
      success: true,
      message: 'Registration request approved and admin account created. Login credentials sent to email.',
      data: {
        request: request.toJSON(),
        admin: adminUser.toJSON(),
        password: generatedPassword, // Return password in response for super-admin to see
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
