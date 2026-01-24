import GovernmentStats from '../models/GovernmentStats.js';
import School from '../models/School.js';
import SchoolRating from '../models/SchoolRating.js';
import User from '../models/User.js';
import Child from '../models/Child.js';
import Payment from '../models/Payment.js';
import TherapyUsage from '../models/TherapyUsage.js';
import AIWarning from '../models/AIWarning.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

/**
 * Get overview statistics
 * GET /api/government/overview
 */
export const getOverview = async (req, res) => {
  try {
    const { region, district, startDate, endDate } = req.query;

    const where = {};
    if (region) {
      where.region = region;
    }
    if (district) {
      where.district = district;
    }

    // Get schools count
    let schoolsCount = 0;
    try {
      schoolsCount = await School.count({
        where: { isActive: true },
      });
    } catch (error) {
      logger.warn('Failed to count schools', { error: error.message });
    }

    // Get total students
    let studentsCount = 0;
    try {
      studentsCount = await Child.count();
    } catch (error) {
      logger.warn('Failed to count students', { error: error.message });
    }

    // Get total teachers
    let teachersCount = 0;
    try {
      teachersCount = await User.count({
        where: { role: 'teacher' },
      });
    } catch (error) {
      logger.warn('Failed to count teachers', { error: error.message });
    }

    // Get total parents
    let parentsCount = 0;
    try {
      parentsCount = await User.count({
        where: { role: 'parent' },
      });
    } catch (error) {
      logger.warn('Failed to count parents', { error: error.message });
    }

    // Get average school rating
    let avgRating = 0;
    try {
      const ratings = await SchoolRating.findAll({
        attributes: ['stars'],
      });
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, r) => acc + (r.stars || 0), 0);
        avgRating = parseFloat((sum / ratings.length).toFixed(2));
      }
    } catch (error) {
      logger.warn('Failed to calculate average rating', { error: error.message });
    }

    // Get total payments
    let totalRevenue = 0;
    try {
      const paymentsWhere = {};
      if (startDate) {
        paymentsWhere.paidAt = { [Op.gte]: new Date(startDate) };
      }
      if (endDate) {
        paymentsWhere.paidAt = { ...paymentsWhere.paidAt, [Op.lte]: new Date(endDate) };
      }

      const payments = await Payment.findAll({
        where: { ...paymentsWhere, status: 'completed' },
        attributes: ['amount'],
      });
      totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    } catch (error) {
      logger.warn('Failed to calculate total revenue', { error: error.message });
    }

    // Get active warnings
    let warningsCount = 0;
    try {
      warningsCount = await AIWarning.count({
        where: { isResolved: false },
      });
    } catch (error) {
      logger.warn('Failed to count warnings', { error: error.message });
    }

    res.json({
      success: true,
      data: {
        schools: schoolsCount,
        students: studentsCount,
        teachers: teachersCount,
        parents: parentsCount,
        averageRating: avgRating,
        totalRevenue,
        activeWarnings: warningsCount,
      },
    });
  } catch (error) {
    logger.error('Get government overview error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({ 
      error: 'Failed to fetch overview statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get schools statistics
 * GET /api/government/schools
 */
export const getSchoolsStats = async (req, res) => {
  try {
    const { region, district, limit = 50, offset = 0 } = req.query;

    const where = { isActive: true };
    // Note: School model doesn't have region/district fields yet
    // This would need to be added to the School model

    let schools;
    try {
      schools = await School.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: SchoolRating,
            as: 'ratings',
            required: false,
          },
          {
            model: Child,
            as: 'schoolChildren',
            required: false,
          },
        ],
      });
    } catch (includeError) {
      // Fallback: get schools without includes if association fails
      logger.warn('School include failed, using fallback', { error: includeError.message });
      schools = await School.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    }

    const schoolsWithStats = await Promise.all(schools.rows.map(async (school) => {
      try {
        const ratings = school.ratings || [];
        const avgRating = ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + (r.stars || 0), 0) / ratings.length).toFixed(2)
          : 0;
        const studentsCount = school.schoolChildren?.length || 0;

        return {
          ...school.toJSON(),
          averageRating: parseFloat(avgRating),
          ratingsCount: ratings.length,
          studentsCount,
        };
      } catch (mapError) {
        // Fallback: get stats separately if map fails
        try {
          const [ratings, children] = await Promise.all([
            SchoolRating.findAll({ where: { schoolId: school.id } }),
            Child.findAll({ where: { schoolId: school.id } }),
          ]);
          
          const avgRating = ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + (r.stars || 0), 0) / ratings.length).toFixed(2)
            : 0;

          return {
            ...school.toJSON(),
            averageRating: parseFloat(avgRating),
            ratingsCount: ratings.length,
            studentsCount: children.length,
          };
        } catch (fallbackError) {
          logger.error('Fallback stats fetch failed', { 
            schoolId: school.id, 
            error: fallbackError.message 
          });
          return {
            ...school.toJSON(),
            averageRating: 0,
            ratingsCount: 0,
            studentsCount: 0,
          };
        }
      }
    }));

    res.json({
      success: true,
      data: {
        schools: schoolsWithStats,
        total: schools.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get schools stats error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({ 
      error: 'Failed to fetch schools statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get students statistics
 * GET /api/government/students
 */
export const getStudentsStats = async (req, res) => {
  try {
    const { schoolId, region, district } = req.query;

    const where = {};
    if (schoolId) {
      where.schoolId = schoolId;
    }

    const students = await Child.findAll({
      where,
      include: [
        {
          model: School,
          as: 'childSchool',
          required: false,
        },
      ],
    });

    // Group by school
    const bySchool = {};
    students.forEach(student => {
      const schoolName = student.childSchool?.name || 'Unknown';
      if (!bySchool[schoolName]) {
        bySchool[schoolName] = 0;
      }
      bySchool[schoolName]++;
    });

    res.json({
      success: true,
      data: {
        total: students.length,
        bySchool,
        students: students.slice(0, 100), // Limit response size
      },
    });
  } catch (error) {
    logger.error('Get students stats error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch students statistics' });
  }
};

/**
 * Get ratings statistics
 * GET /api/government/ratings
 */
export const getRatingsStats = async (req, res) => {
  try {
    const { schoolId, startDate, endDate } = req.query;

    const where = {};
    if (schoolId) {
      where.schoolId = schoolId;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const ratings = await SchoolRating.findAll({
      where,
      include: [
        {
          model: School,
          as: 'school',
          required: false,
        },
      ],
    });

    // Calculate statistics
    const totalRatings = ratings.length;
    const avgRating = totalRatings > 0
      ? (ratings.reduce((sum, r) => sum + r.stars, 0) / totalRatings).toFixed(2)
      : 0;

    const ratingDistribution = {
      5: ratings.filter(r => r.stars === 5).length,
      4: ratings.filter(r => r.stars === 4).length,
      3: ratings.filter(r => r.stars === 3).length,
      2: ratings.filter(r => r.stars === 2).length,
      1: ratings.filter(r => r.stars === 1).length,
    };

    res.json({
      success: true,
      data: {
        total: totalRatings,
        average: parseFloat(avgRating),
        distribution: ratingDistribution,
        ratings: ratings.slice(0, 100), // Limit response size
      },
    });
  } catch (error) {
    logger.error('Get ratings stats error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch ratings statistics' });
  }
};

/**
 * Get payments statistics
 * GET /api/government/payments
 */
export const getPaymentsStats = async (req, res) => {
  try {
    const { startDate, endDate, schoolId } = req.query;

    const where = { status: 'completed' };
    if (schoolId) {
      where.schoolId = schoolId;
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

    const payments = await Payment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'parent',
          required: false,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: School,
          as: 'school',
          required: false,
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    // If some payments don't have parent or school, fetch them separately
    const parentIds = [...new Set(payments.map(p => p.parentId).filter(Boolean))];
    const schoolIds = [...new Set(payments.map(p => p.schoolId).filter(Boolean))];
    
    const parentsMap = new Map();
    const schoolsMap = new Map();
    
    if (parentIds.length > 0) {
      const parents = await User.findAll({
        where: { id: { [Op.in]: parentIds } },
        attributes: ['id', 'firstName', 'lastName', 'email'],
      });
      parents.forEach(p => parentsMap.set(p.id, p));
    }
    
    if (schoolIds.length > 0) {
      try {
        const schools = await School.findAll({
          where: { id: { [Op.in]: schoolIds } },
          attributes: ['id', 'name'],
        });
        schools.forEach(s => {
          schoolsMap.set(s.id, s);
          logger.debug('Added school to map', { schoolId: s.id, schoolName: s.name });
        });
        logger.info('Fetched schools for payments', {
          schoolIdsCount: schoolIds.length,
          schoolsFound: schools.length,
          schoolIds: schoolIds.slice(0, 5), // Log first 5 for debugging
        });
      } catch (error) {
        logger.error('Error fetching schools for payments', {
          error: error.message,
          stack: error.stack,
          schoolIds: schoolIds,
        });
      }
    } else {
      logger.warn('No schoolIds found in payments', {
        paymentsCount: payments.length,
        paymentsWithSchoolId: payments.filter(p => p.schoolId).length,
      });
    }

    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const byType = {};
    payments.forEach(p => {
      const type = p.paymentType;
      if (!byType[type]) {
        byType[type] = { count: 0, amount: 0 };
      }
      byType[type].count++;
      byType[type].amount += parseFloat(p.amount || 0);
    });

    // Format payments with parent and school names
    const formattedPayments = payments.map(payment => {
      const paymentData = payment.toJSON();
      
      // Get parent from include or from map
      const parent = payment.parent || (payment.parentId ? parentsMap.get(payment.parentId) : null);
      const parentName = parent 
        ? `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || parent.email || null
        : null;
      
      // Get school from include or from map
      let school = payment.school;
      if (!school && payment.schoolId) {
        school = schoolsMap.get(payment.schoolId);
        if (!school) {
          // Try to fetch school directly if not in map
          try {
            const directSchool = await School.findByPk(payment.schoolId, {
              attributes: ['id', 'name'],
            });
            if (directSchool) {
              school = directSchool;
              schoolsMap.set(payment.schoolId, directSchool);
            }
          } catch (error) {
            logger.warn('Error fetching school directly', {
              paymentId: payment.id,
              schoolId: payment.schoolId,
              error: error.message,
            });
          }
        }
      }
      
      const schoolName = school?.name || null;
      
      // Debug logging
      if (!schoolName && payment.schoolId) {
        logger.warn('School not found for payment', {
          paymentId: payment.id,
          schoolId: payment.schoolId,
          schoolFromInclude: !!payment.school,
          schoolFromMap: !!schoolsMap.get(payment.schoolId),
          schoolsMapSize: schoolsMap.size,
          allSchoolIds: Array.from(schoolsMap.keys()),
        });
      }
      
      return {
        ...paymentData,
        parentName: parentName,
        schoolName: schoolName,
        // Also include parent and school objects for fallback
        parent: parent ? {
          id: parent.id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
        } : null,
        school: school ? {
          id: school.id,
          name: school.name,
        } : null,
      };
    });

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalPayments: payments.length,
        byType,
        payments: formattedPayments,
      },
    });
  } catch (error) {
    logger.error('Get payments stats error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch payments statistics' });
  }
};

/**
 * Generate and save statistics
 * POST /api/government/stats/generate
 */
export const generateStats = async (req, res) => {
  try {
    const {
      statType,
      period,
      periodStart,
      periodEnd,
      region,
      district,
      schoolId,
    } = req.body;

    if (!statType || !period || !periodStart || !periodEnd) {
      return res.status(400).json({ error: 'Stat type, period, and dates are required' });
    }

    let data = {};

    switch (statType) {
      case 'overview':
        // Get overview data
        const overview = await getOverviewData(region, district, periodStart, periodEnd);
        data = overview;
        break;
      case 'schools':
        const schools = await getSchoolsData(region, district);
        data = schools;
        break;
      case 'ratings':
        const ratings = await getRatingsData(schoolId, periodStart, periodEnd);
        data = ratings;
        break;
      case 'payments':
        const payments = await getPaymentsData(schoolId, periodStart, periodEnd);
        data = payments;
        break;
      default:
        return res.status(400).json({ error: 'Invalid stat type' });
    }

    const stats = await GovernmentStats.create({
      region: region || null,
      district: district || null,
      schoolId: schoolId || null,
      statType,
      period,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      data,
      generatedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Generate stats error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to generate statistics' });
  }
};

/**
 * Get saved statistics
 * GET /api/government/stats
 */
export const getSavedStats = async (req, res) => {
  try {
    const {
      statType,
      period,
      region,
      district,
      schoolId,
      limit = 20,
      offset = 0,
    } = req.query;

    const where = {};
    if (statType) {
      where.statType = statType;
    }
    if (period) {
      where.period = period;
    }
    if (region) {
      where.region = region;
    }
    if (district) {
      where.district = district;
    }
    if (schoolId) {
      where.schoolId = schoolId;
    }

    const stats = await GovernmentStats.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['generatedAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'generator',
          required: false,
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        stats: stats.rows,
        total: stats.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get saved stats error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch saved statistics' });
  }
};

// Helper functions
async function getOverviewData(region, district, startDate, endDate) {
  const schoolsCount = await School.count({ where: { isActive: true } });
  const studentsCount = await Child.count();
  const teachersCount = await User.count({ where: { role: 'teacher' } });
  const parentsCount = await User.count({ where: { role: 'parent' } });
  
  const ratings = await SchoolRating.findAll();
  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(2)
    : 0;

  return {
    schools: schoolsCount,
    students: studentsCount,
    teachers: teachersCount,
    parents: parentsCount,
    averageRating: parseFloat(avgRating),
  };
}

async function getSchoolsData(region, district) {
  const schools = await School.findAll({ where: { isActive: true } });
  return { schools: schools.length, data: schools };
}

async function getRatingsData(schoolId, startDate, endDate) {
  const where = {};
  if (schoolId) where.schoolId = schoolId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }
  const ratings = await SchoolRating.findAll({ where });
  return { ratings: ratings.length, data: ratings };
}

async function getPaymentsData(schoolId, startDate, endDate) {
  const where = { status: 'completed' };
  if (schoolId) where.schoolId = schoolId;
  if (startDate || endDate) {
    where.paidAt = {};
    if (startDate) where.paidAt[Op.gte] = new Date(startDate);
    if (endDate) where.paidAt[Op.lte] = new Date(endDate);
  }
  const payments = await Payment.findAll({ where });
  const total = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  return { totalRevenue: total, payments: payments.length, data: payments };
}

/**
 * Get all Admin accounts (Government view)
 * GET /api/government/admins
 */
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    logger.info('Government fetched admins', {
      count: admins.length,
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: admins.map(a => a.toJSON()),
      count: admins.length,
    });
  } catch (error) {
    logger.error('Get admins error (government)', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({ 
      error: 'Failed to fetch admin accounts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get admin details with all related data
 * GET /api/government/admins/:id
 */
export const getAdminDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findOne({
      where: { id, role: 'admin' },
      attributes: { exclude: ['password'] },
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Get all receptions created by this admin
    const receptions = await User.findAll({
      where: { role: 'reception', createdBy: id },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    const receptionIds = receptions.map(r => r.id);

    // Get schools created by these receptions
    let schools = [];
    if (receptionIds.length > 0) {
      try {
        schools = await School.findAll({
          where: { createdBy: { [Op.in]: receptionIds } },
          order: [['createdAt', 'DESC']],
        });
      } catch (error) {
        logger.warn('Failed to fetch schools for admin', { error: error.message, adminId: id });
        schools = [];
      }
    }

    // Get teachers created by these receptions
    let teachers = [];
    if (receptionIds.length > 0) {
      try {
        teachers = await User.findAll({
          where: { 
            role: 'teacher',
            createdBy: { [Op.in]: receptionIds }
          },
          attributes: { exclude: ['password'] },
          order: [['createdAt', 'DESC']],
        });
      } catch (error) {
        logger.warn('Failed to fetch teachers for admin', { error: error.message, adminId: id });
        teachers = [];
      }
    }

    // Get parents created by these receptions
    let parents = [];
    if (receptionIds.length > 0) {
      try {
        parents = await User.findAll({
          where: { 
            role: 'parent',
            createdBy: { [Op.in]: receptionIds }
          },
          attributes: { exclude: ['password'] },
          order: [['createdAt', 'DESC']],
        });
      } catch (error) {
        logger.warn('Failed to fetch parents for admin', { error: error.message, adminId: id });
        parents = [];
      }
    }

    // Get children of these parents
    const parentIds = parents.map(p => p.id);
    let children = [];
    if (parentIds.length > 0) {
      try {
        children = await Child.findAll({
          where: { parentId: { [Op.in]: parentIds } },
          order: [['createdAt', 'DESC']],
        });
      } catch (error) {
        logger.warn('Failed to fetch children for admin', { error: error.message, adminId: id });
        children = [];
      }
    }

    // Get total students count
    const studentsCount = children.length;

    // Get total revenue from payments
    let totalRevenue = 0;
    if (parentIds.length > 0) {
      try {
        const payments = await Payment.findAll({
          where: { parentId: { [Op.in]: parentIds } },
          attributes: ['amount'],
        });
        totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      } catch (error) {
        logger.warn('Failed to fetch payments for admin', { error: error.message, adminId: id });
        totalRevenue = 0;
      }
    }

    // Get school ratings
    const schoolIds = schools.map(s => s.id);
    let ratings = [];
    let avgRating = 0;
    if (schoolIds.length > 0) {
      try {
        ratings = await SchoolRating.findAll({
          where: { schoolId: { [Op.in]: schoolIds } },
          attributes: ['stars'],
        });
        if (ratings.length > 0) {
          const sum = ratings.reduce((acc, r) => acc + (r.stars || 0), 0);
          avgRating = parseFloat((sum / ratings.length).toFixed(1));
        }
      } catch (error) {
        logger.warn('Failed to fetch ratings for admin', { error: error.message, adminId: id });
        ratings = [];
        avgRating = 0;
      }
    }

    logger.info('Government fetched admin details', {
      adminId: id,
      receptionsCount: receptions.length,
      schoolsCount: schools.length,
      teachersCount: teachers.length,
      parentsCount: parents.length,
      studentsCount: studentsCount,
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: {
        admin: admin.toJSON(),
        stats: {
          receptions: receptions.length,
          schools: schools.length,
          teachers: teachers.length,
          parents: parents.length,
          students: studentsCount,
          totalRevenue,
          averageRating: parseFloat(avgRating),
          ratingsCount: ratings.length,
        },
        receptions: receptions.map(r => r.toJSON()),
        schools: schools.map(s => s.toJSON()),
        teachers: teachers.map(t => t.toJSON()),
        parents: parents.map(p => p.toJSON()),
        children: children.map(c => c.toJSON()),
      },
    });
  } catch (error) {
    logger.error('Get admin details error (government)', { 
      error: error.message, 
      stack: error.stack,
      adminId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ 
      error: 'Failed to fetch admin details',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};