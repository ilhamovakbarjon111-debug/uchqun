import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Child from '../models/Child.js';
import School from '../models/School.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

// TODO: Integrate with payment providers (Payme, Click, Uzcard, etc.)
// For now, this is a placeholder implementation

/**
 * Create payment
 * POST /api/payments
 * Can be called by Parent or Admin
 */
export const createPayment = async (req, res) => {
  try {
    const {
      childId,
      schoolId,
      amount,
      currency = 'UZS',
      paymentType,
      paymentMethod,
      paymentProvider,
      description,
      metadata,
      parentId: providedParentId, // Admin can specify parentId
    } = req.body;

    // Admin can create payment for any parent, parent can only create for themselves
    const parentId = req.user.role === 'admin' ? (providedParentId || req.user.id) : req.user.id;

    if (!amount || !paymentType || !paymentMethod) {
      return res.status(400).json({ error: 'Amount, payment type, and payment method are required' });
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

    // Generate transaction ID
    const transactionId = `${paymentProvider || 'system'}_${uuidv4()}`;

    const payment = await Payment.create({
      parentId,
      childId: childId || null,
      schoolId: schoolId || null,
      amount: parseFloat(amount),
      currency,
      paymentType,
      paymentMethod,
      paymentProvider: paymentProvider || null,
      transactionId,
      status: 'pending',
      description,
      metadata: metadata || {},
    });

    // TODO: Process payment with payment provider
    // For now, simulate payment processing
    setTimeout(async () => {
      try {
        await payment.update({
          status: 'completed',
          paidAt: new Date(),
        });
      } catch (err) {
        logger.error('Payment processing error', { error: err.message });
      }
    }, 2000);

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error('Create payment error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

/**
 * Get payments
 * GET /api/payments
 */
export const getPayments = async (req, res) => {
  try {
    const {
      childId,
      schoolId,
      paymentType,
      status,
      startDate,
      endDate,
      limit = 20,
      offset = 0,
    } = req.query;

    const where = {};

    // Role-based filtering
    if (req.user.role === 'parent') {
      where.parentId = req.user.id;
    } else if (req.user.role === 'admin') {
      // Admin can see payments for parents created by their receptions
      const receptions = await User.findAll({
        where: { role: 'reception', createdBy: req.user.id },
        attributes: ['id'],
      });
      const receptionIds = receptions.map(r => r.id);
      if (receptionIds.length > 0) {
        const parents = await User.findAll({
          where: { role: 'parent', createdBy: { [Op.in]: receptionIds } },
          attributes: ['id'],
        });
        const parentIds = parents.map(p => p.id);
        if (parentIds.length > 0) {
          where.parentId = { [Op.in]: parentIds };
        } else {
          // No parents, return empty
          return res.json({
            success: true,
            data: {
              payments: [],
              total: 0,
              totalAmount: 0,
              limit: parseInt(limit),
              offset: parseInt(offset),
            },
          });
        }
      } else {
        // No receptions, return empty
        return res.json({
          success: true,
          data: {
            payments: [],
            total: 0,
            totalAmount: 0,
            limit: parseInt(limit),
            offset: parseInt(offset),
          },
        });
      }
    }
    // Super-admin can see all payments (no filter)

    if (childId) {
      where.childId = childId;
    }

    if (schoolId) {
      where.schoolId = schoolId;
    }

    if (paymentType) {
      where.paymentType = paymentType;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) {
        where.paidAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.paidAt[Op.lte] = new Date(endDate);
      }
    }

    const payments = await Payment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Child,
          as: 'child',
          required: false,
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: School,
          as: 'school',
          required: false,
          attributes: ['id', 'name'],
        },
      ],
    });

    // Calculate totals
    const totalAmount = payments.rows.reduce((sum, p) => {
      return sum + (parseFloat(p.amount) || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        payments: payments.rows,
        total: payments.count,
        totalAmount,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get payments error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'parent',
          required: false,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Child,
          as: 'child',
          required: false,
        },
        {
          model: School,
          as: 'school',
          required: false,
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify access
    if (req.user.role === 'parent' && payment.parentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error('Get payment error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

/**
 * Process payment callback (from payment provider)
 * POST /api/payments/callback
 */
export const paymentCallback = async (req, res) => {
  try {
    const { transactionId, status, amount, metadata } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    const payment = await Payment.findOne({
      where: { transactionId },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    if (status === 'success' || status === 'completed') {
      await payment.update({
        status: 'completed',
        paidAt: new Date(),
        metadata: { ...payment.metadata, ...metadata },
      });
    } else if (status === 'failed' || status === 'error') {
      await payment.update({
        status: 'failed',
        metadata: { ...payment.metadata, ...metadata },
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error('Payment callback error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to process payment callback' });
  }
};

/**
 * Refund payment
 * POST /api/payments/:id/refund
 */
export const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, refundReason } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }

    const refund = parseFloat(refundAmount) || parseFloat(payment.amount);

    await payment.update({
      status: 'refunded',
      refundAmount: refund,
      refundedAt: new Date(),
      refundReason,
    });

    // TODO: Process refund with payment provider

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error('Refund payment error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to refund payment' });
  }
};
