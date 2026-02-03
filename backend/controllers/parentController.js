import User from '../models/User.js';
import Group from '../models/Group.js';
import ParentActivity from '../models/ParentActivity.js';
import ParentMeal from '../models/ParentMeal.js';
import ParentMedia from '../models/ParentMedia.js';
import Child from '../models/Child.js';
import TeacherRating from '../models/TeacherRating.js';
import School from '../models/School.js';
import SchoolRating from '../models/SchoolRating.js';
import SuperAdminMessage from '../models/SuperAdminMessage.js';
// Teacher-created data tables (linked to childId)
import Activity from '../models/Activity.js';
import Meal from '../models/Meal.js';
import Media from '../models/Media.js';
import logger from '../utils/logger.js';
import { Op, fn, col } from 'sequelize';
import sequelize from '../config/database.js';
import { computeAverageRating } from '../utils/governmentLevel.js';

/**
 * Parent Controller
 * Handles Parent-specific operations:
 * - View own activities, meals, and media
 * - Parents only see data related to their own account
 */

/**
 * Get parent's children
 * GET /api/parent/children
 * 
 * Business Logic:
 * - Parents can view their own children
 */
export const getMyChildren = async (req, res) => {
  try {
    const children = await Child.findAll({
      where: { parentId: req.user.id },
      order: [['firstName', 'ASC']],
    });

    res.json({
      success: true,
      data: children,
    });
  } catch (error) {
    logger.error('Get my children error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch children' });
  }
};

/**
 * Get parent's activities (from their group)
 * GET /api/parent/activities
 *
 * Business Logic:
 * - Parents see ALL activities from their group (any child in same group)
 * - Queries teacher-created activities linked to children via groupId
 */
export const getMyActivities = async (req, res) => {
  try {
    const { limit = 50, offset = 0, activityType, startDate, endDate } = req.query;

    // Get parent's groupId
    const parent = await User.findByPk(req.user.id, { attributes: ['groupId'] });

    if (!parent || !parent.groupId) {
      // Fallback to legacy parent_activities if no group assigned
      const where = { parentId: req.user.id };

      if (activityType) {
        where.activityType = activityType;
      }

      if (startDate || endDate) {
        where.activityDate = {};
        if (startDate) where.activityDate[Op.gte] = new Date(startDate);
        if (endDate) where.activityDate[Op.lte] = new Date(endDate);
      }

      const activities = await ParentActivity.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['activityDate', 'DESC']],
      });

      return res.json({
        success: true,
        data: activities.rows,
        total: activities.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    }

    // Query teacher-created activities for all children in the parent's group
    const whereActivity = {};

    if (activityType) {
      whereActivity.type = activityType;
    }

    if (startDate || endDate) {
      whereActivity.date = {};
      if (startDate) whereActivity.date[Op.gte] = new Date(startDate);
      if (endDate) whereActivity.date[Op.lte] = new Date(endDate);
    }

    const activities = await Activity.findAndCountAll({
      where: whereActivity,
      include: [{
        model: Child,
        as: 'child',
        where: { groupId: parent.groupId },
        attributes: ['id', 'firstName', 'lastName', 'photo'],
        required: true,
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: activities.rows,
      total: activities.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    logger.error('Get my activities error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

/**
 * Get a specific activity
 * GET /api/parent/activities/:id
 */
export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await ParentActivity.findOne({
      where: { id, parentId: req.user.id },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    logger.error('Get activity by id error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

/**
 * Get parent's meals (from their group)
 * GET /api/parent/meals
 *
 * Business Logic:
 * - Parents see ALL meals from their group (any child in same group)
 * - Queries teacher-created meals linked to children via groupId
 */
export const getMyMeals = async (req, res) => {
  try {
    const { limit = 50, offset = 0, mealType, startDate, endDate } = req.query;

    // Get parent's groupId
    const parent = await User.findByPk(req.user.id, { attributes: ['groupId'] });

    if (!parent || !parent.groupId) {
      // Fallback to legacy parent_meals if no group assigned
      const where = { parentId: req.user.id };

      if (mealType) {
        where.mealType = mealType;
      }

      if (startDate || endDate) {
        where.mealDate = {};
        if (startDate) where.mealDate[Op.gte] = new Date(startDate);
        if (endDate) where.mealDate[Op.lte] = new Date(endDate);
      }

      const meals = await ParentMeal.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['mealDate', 'DESC']],
      });

      return res.json({
        success: true,
        data: meals.rows,
        total: meals.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    }

    // Query teacher-created meals for all children in the parent's group
    const whereMeal = {};

    if (mealType) {
      whereMeal.mealType = mealType;
    }

    if (startDate || endDate) {
      whereMeal.date = {};
      if (startDate) whereMeal.date[Op.gte] = new Date(startDate);
      if (endDate) whereMeal.date[Op.lte] = new Date(endDate);
    }

    const meals = await Meal.findAndCountAll({
      where: whereMeal,
      include: [{
        model: Child,
        as: 'child',
        where: { groupId: parent.groupId },
        attributes: ['id', 'firstName', 'lastName', 'photo'],
        required: true,
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: meals.rows,
      total: meals.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    logger.error('Get my meals error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
};

/**
 * Get a specific meal
 * GET /api/parent/meals/:id
 */
export const getMealById = async (req, res) => {
  try {
    const { id } = req.params;

    const meal = await ParentMeal.findOne({
      where: { id, parentId: req.user.id },
    });

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.json({
      success: true,
      data: meal,
    });
  } catch (error) {
    logger.error('Get meal by id error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch meal' });
  }
};

/**
 * Get parent's media (from their group)
 * GET /api/parent/media
 *
 * Business Logic:
 * - Parents see ALL media from their group (any child in same group)
 * - Queries teacher-created media linked to children via groupId
 */
export const getMyMedia = async (req, res) => {
  try {
    const { limit = 50, offset = 0, fileType } = req.query;

    // Get parent's groupId
    const parent = await User.findByPk(req.user.id, { attributes: ['groupId'] });

    if (!parent || !parent.groupId) {
      // Fallback to legacy parent_media if no group assigned
      const where = { parentId: req.user.id };

      if (fileType) {
        where.fileType = fileType;
      }

      const media = await ParentMedia.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['uploadDate', 'DESC']],
      });

      return res.json({
        success: true,
        data: media.rows,
        total: media.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    }

    // Query teacher-created media for all children in the parent's group
    const whereMedia = {};

    if (fileType) {
      whereMedia.type = fileType;
    }

    const media = await Media.findAndCountAll({
      where: whereMedia,
      include: [{
        model: Child,
        as: 'child',
        where: { groupId: parent.groupId },
        attributes: ['id', 'firstName', 'lastName', 'photo'],
        required: true,
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: media.rows,
      total: media.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    logger.error('Get my media error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch media' });
  }
};

/**
 * Get a specific media file
 * GET /api/parent/media/:id
 */
export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await ParentMedia.findOne({
      where: { id, parentId: req.user.id },
    });

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({
      success: true,
      data: media,
    });
  } catch (error) {
    logger.error('Get media by id error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch media' });
  }
};

/**
 * Get parent profile with summary
 * GET /api/parent/profile
 */
export const getMyProfile = async (req, res) => {
  try {
    // Fetch user with relationships (assigned teacher and group)
    const userWithRelations = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: User,
          as: 'assignedTeacher',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          required: false,
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'description'],
          required: false,
        },
      ],
    });

    const activitiesCount = await ParentActivity.count({
      where: { parentId: req.user.id },
    });

    const mealsCount = await ParentMeal.count({
      where: { parentId: req.user.id },
    });

    const mediaCount = await ParentMedia.count({
      where: { parentId: req.user.id },
    });

    res.json({
      success: true,
      data: {
        user: userWithRelations.toJSON(),
        summary: {
          activitiesCount,
          mealsCount,
          mediaCount,
        },
      },
    });
  } catch (error) {
    logger.error('Get my profile error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Get parent data for viewing (used when clicking on parent in list)
 * GET /api/parent/:parentId/data
 * 
 * Business Logic:
 * - When viewing the list of parents, clicking on a parent should display:
 *   - Activity
 *   - Meals
 *   - Media
 * - This endpoint can be accessed by Admin or Reception to view parent data
 */
export const getParentData = async (req, res) => {
  try {
    const { parentId } = req.params;

    // Verify the user is a parent
    const parent = await User.findOne({
      where: { id: parentId, role: 'parent' },
      attributes: { exclude: ['password'] },
    });

    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Get all parent data
    const [activities, meals, media] = await Promise.all([
      ParentActivity.findAll({
        where: { parentId: parentId },
        order: [['activityDate', 'DESC']],
        limit: 10,
      }),
      ParentMeal.findAll({
        where: { parentId: parentId },
        order: [['mealDate', 'DESC']],
        limit: 10,
      }),
      ParentMedia.findAll({
        where: { parentId: parentId },
        order: [['uploadDate', 'DESC']],
        limit: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        parent: parent.toJSON(),
        activities,
        meals,
        media,
      },
    });
  } catch (error) {
    logger.error('Get parent data error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch parent data' });
  }
};

/**
 * Rate assigned teacher
 * POST /api/parent/ratings
 * Body: { stars: 1-5, comment?: string }
 */
export const rateMyTeacher = async (req, res) => {
  try {
    const { stars, comment } = req.body;

    if (!stars || Number.isNaN(Number(stars))) {
      return res.status(400).json({ error: 'Stars is required' });
    }
    const starsNum = Number(stars);
    if (starsNum < 1 || starsNum > 5) {
      return res.status(400).json({ error: 'Stars must be between 1 and 5' });
    }

    // Ensure parent has assigned teacher
    const parent = await User.findByPk(req.user.id);
    if (!parent || !parent.teacherId) {
      return res.status(400).json({ error: 'Assigned teacher not found' });
    }

    // Upsert rating
    const [rating, created] = await TeacherRating.findOrCreate({
      where: { teacherId: parent.teacherId, parentId: req.user.id },
      defaults: {
        stars: starsNum,
        comment: comment || null,
      },
    });

    if (!created) {
      rating.stars = starsNum;
      rating.comment = comment || null;
      await rating.save();
    }

    // Update teacher's rating and totalRatings
    try {
      const allRatings = await TeacherRating.findAll({
        where: { teacherId: parent.teacherId },
        attributes: ['stars'],
      });

      const totalRatings = allRatings.length;
      const averageRating = totalRatings > 0
        ? allRatings.reduce((sum, r) => sum + (r.stars || 0), 0) / totalRatings
        : 0;

      await User.update(
        {
          rating: parseFloat(averageRating.toFixed(2)),
          totalRatings: totalRatings,
        },
        {
          where: { id: parent.teacherId },
        }
      );

      logger.info('Updated teacher rating', {
        teacherId: parent.teacherId,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalRatings,
      });
    } catch (updateError) {
      logger.error('Error updating teacher rating', {
        error: updateError.message,
        teacherId: parent.teacherId,
      });
      // Don't fail the request if rating update fails
    }

    res.json({
      success: true,
      message: 'Teacher rating saved successfully',
      data: rating.toJSON(),
    });
  } catch (error) {
    logger.error('Rate teacher error', { 
      error: error.message, 
      stack: error.stack,
      parentId: req.user?.id,
      teacherId: req.user?.teacherId,
    });
    res.status(500).json({ 
      error: 'Failed to rate teacher',
      message: 'An error occurred while saving the rating. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get parent's current rating and teacher average
 * GET /api/parent/ratings
 * Also returns all ratings from other parents for the same teacher
 */
export const getMyRating = async (req, res) => {
  try {
    const parent = await User.findByPk(req.user.id);

    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    if (!parent.teacherId) {
      return res.status(400).json({ 
        error: 'Assigned teacher not found',
        data: {
          rating: null,
          summary: { average: 0, count: 0 },
          allRatings: []
        }
      });
    }

    // Get parent's own rating
    const rating = await TeacherRating.findOne({
      where: { teacherId: parent.teacherId, parentId: req.user.id },
    });

    // Get summary (average and count) - use aggregate functions safely
    let average = 0;
    let count = 0;
    
    try {
      const summaryRaw = await TeacherRating.findOne({
        where: { teacherId: parent.teacherId },
        attributes: [
          [fn('AVG', col('stars')), 'averageStars'],
          [fn('COUNT', col('id')), 'totalRatings'],
        ],
        raw: true,
      });

      average = summaryRaw?.averageStars
        ? Number(parseFloat(summaryRaw.averageStars).toFixed(2))
        : 0;
      count = summaryRaw?.totalRatings ? Number(summaryRaw.totalRatings) : 0;
    } catch (summaryError) {
      logger.warn('Error calculating rating summary', { 
        error: summaryError.message,
        teacherId: parent.teacherId 
      });
      // Continue with default values
    }

    // Get all ratings for this teacher with parent information
    let allRatings = [];
    let formattedRatings = [];
    
    try {
      allRatings = await TeacherRating.findAll({
        where: { teacherId: parent.teacherId },
        include: [
          {
            model: User,
            as: 'ratingParent',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
        ],
        order: [['updatedAt', 'DESC']],
      });

      // Format ratings with parent names
      formattedRatings = allRatings.map((r) => ({
        ...r.toJSON(),
        parentName: r.ratingParent
          ? `${r.ratingParent.firstName || ''} ${r.ratingParent.lastName || ''}`.trim()
          : null,
        parentEmail: r.ratingParent?.email || null,
      }));
    } catch (ratingsError) {
      logger.warn('Error fetching all ratings', { 
        error: ratingsError.message,
        teacherId: parent.teacherId 
      });
      // Continue with empty array
    }

    logger.info('Get my rating response', {
      parentId: req.user.id,
      teacherId: parent.teacherId,
      ratingsCount: allRatings.length,
      formattedRatingsCount: formattedRatings.length,
      summary: { average, count },
    });

    res.json({
      success: true,
      data: {
        rating: rating ? rating.toJSON() : null,
        summary: {
          average,
          count,
        },
        allRatings: formattedRatings, // All ratings from all parents
      },
    });
  } catch (error) {
    logger.error('Get rating error', { 
      error: error.message, 
      stack: error.stack,
      parentId: req.user?.id,
      teacherId: req.user?.teacherId 
    });
    res.status(500).json({ 
      error: 'Failed to fetch rating',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get AI advice for parents
 * POST /api/parent/ai/chat
 * 
 * Business Logic:
 * - Parents can ask AI for advice about caring for their child at home
 * - AI provides advice about caring for children with disabilities
 * - Uses OpenAI API or fallback to rule-based responses
 */
/**
 * Rate a school (maktab yoki bog'cha)
 * POST /api/parent/school-rating
 */
export const rateSchool = async (req, res) => {
  try {
    const { schoolId, schoolName, stars, evaluation, comment } = req.body;
    const parentId = req.user?.id;

    if (!parentId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Support both old stars format (for backward compatibility) and new evaluation format
    let evaluationData = evaluation !== undefined ? evaluation : null;
    // Only process stars if it's explicitly provided and not undefined/null
    // If evaluation is provided, ignore stars completely
    let starsNum = null;
    if (stars !== undefined && stars !== null && evaluation === undefined) {
      const starsValue = Number(stars);
      if (!isNaN(starsValue) && starsValue >= 1 && starsValue <= 5) {
        starsNum = starsValue;
      }
    }

    // Validate stars if provided (only if no evaluation)
    if (starsNum !== null && (isNaN(starsNum) || starsNum < 1 || starsNum > 5)) {
      return res.status(400).json({ error: 'Stars must be a number between 1 and 5' });
    }

    // If evaluation is provided, use it and ignore stars completely
    // Otherwise fall back to stars for backward compatibility
    if (evaluationData !== null && evaluationData !== undefined && typeof evaluationData === 'object' && !Array.isArray(evaluationData)) {
      // Check if evaluation object has any keys
      const evaluationKeys = Object.keys(evaluationData);
      
      if (evaluationKeys.length > 0) {
        // Validate evaluation criteria
        const validKeys = [
          'officiallyRegistered',
          'qualifiedSpecialists',
          'individualPlan',
          'safeEnvironment',
          'medicalRequirements',
          'developmentalActivities',
          'foodQuality',
          'regularInformation',
          'clearPayments',
          'kindAttitude'
        ];
        
        // Ensure all keys are boolean
        const validatedEvaluation = {};
        let hasAtLeastOneTrue = false;
        
        for (const key of validKeys) {
          const value = evaluationData[key] === true;
          validatedEvaluation[key] = value;
          if (value) {
            hasAtLeastOneTrue = true;
          }
        }
        
        // If no criteria is selected, return error
        if (!hasAtLeastOneTrue) {
          return res.status(400).json({ 
            error: 'At least one evaluation criterion must be selected',
            message: 'Please select at least one evaluation criterion to rate the school'
          });
        }
        
        evaluationData = validatedEvaluation;
        // If evaluation is valid, ignore stars completely
        starsNum = null;
      } else {
        // Empty object - treat as no evaluation, check if stars provided
        if (starsNum === null || starsNum === undefined) {
          return res.status(400).json({ 
            error: 'Evaluation criteria or stars are required',
            message: 'Please select at least one evaluation criterion or provide a star rating'
          });
        }
        evaluationData = null;
      }
    } else if (starsNum !== null && starsNum !== undefined && !isNaN(starsNum) && starsNum >= 1 && starsNum <= 5) {
      // Backward compatibility: use stars if provided and valid
      evaluationData = null;
    } else {
      return res.status(400).json({ 
        error: 'Evaluation criteria or stars are required',
        message: 'Please select at least one evaluation criterion or provide a star rating (1-5)'
      });
    }

    let school = null;
    let finalSchoolId = schoolId;

    // If schoolId is provided, find school by ID
    if (schoolId) {
      try {
        school = await School.findByPk(schoolId);
        if (!school) {
          return res.status(404).json({ error: 'School not found' });
        }
        finalSchoolId = schoolId;
      } catch (schoolError) {
        logger.error('Error finding school by ID', {
          error: schoolError.message,
          stack: schoolError.stack,
          schoolId,
          parentId,
        });
        return res.status(500).json({ error: 'Failed to find school' });
      }
    } else if (schoolName && typeof schoolName === 'string' && schoolName.trim().length > 0) {
      // If schoolName is provided but no schoolId, try to find or create school
      try {
        school = await School.findOne({
          where: {
            name: {
              [Op.iLike]: schoolName.trim(),
            },
          },
        });

        if (!school) {
          // Try partial match
          school = await School.findOne({
            where: {
              name: {
                [Op.iLike]: `%${schoolName.trim()}%`,
              },
            },
          });
        }

        if (school) {
          finalSchoolId = school.id;
        } else {
          // Create new school if not found
          try {
            school = await School.create({
              name: schoolName.trim(),
              type: 'both', // Default value for new schools
            });
            finalSchoolId = school.id;
            logger.info('School created during rating', {
              schoolId: school.id,
              schoolName: school.name,
              parentId,
            });
          } catch (createError) {
            logger.error('Error creating school during rating', {
              error: createError.message,
              stack: createError.stack,
              schoolName: schoolName.trim(),
              parentId,
            });
            return res.status(500).json({ error: 'Failed to create school' });
          }
        }
      } catch (findError) {
        logger.error('Error finding school by name', {
          error: findError.message,
          stack: findError.stack,
          schoolName: schoolName.trim(),
          parentId,
        });
        return res.status(500).json({ error: 'Failed to find school' });
      }
    } else {
      return res.status(400).json({ error: 'School ID or school name is required' });
    }

    // Ensure we have a valid schoolId before proceeding
    if (!finalSchoolId || finalSchoolId === null || finalSchoolId === undefined) {
      logger.error('No schoolId available for rating', {
        schoolId,
        schoolName,
        finalSchoolId,
        hasSchool: !!school,
      });
      return res.status(400).json({ error: 'Unable to identify school for rating' });
    }

    // Check if parent has any children (optional validation)
    // If parent has children, try to update their schoolId if it matches
    try {
      const children = await Child.findAll({
        where: { parentId },
        limit: 1,
      });
      
      if (children.length > 0) {
        const child = children[0];
        // Update child's schoolId if it was null and school name matches
        if (!child.schoolId && finalSchoolId && school) {
          try {
            await child.update({ schoolId: finalSchoolId });
            logger.info('Updated child schoolId', {
              childId: child.id,
              schoolId: finalSchoolId,
            });
          } catch (err) {
            logger.warn('Failed to update child schoolId during rating', {
              childId: child.id,
              schoolId: finalSchoolId,
              error: err.message,
            });
          }
        }
      }
    } catch (err) {
      logger.warn('Error checking children during rating', {
        error: err.message,
        parentId,
      });
      // Continue with rating even if child check fails
    }

    // Create or update rating
    logger.info('Creating/updating school rating', {
      schoolId: finalSchoolId,
      parentId,
      hasEvaluation: !!evaluationData,
      stars: starsNum,
    });

    let rating;
    let created = false;
    
    // Prepare evaluation data - ensure it's a valid object or empty object
    // Model has defaultValue: {} for evaluation, so use empty object instead of null
    let finalEvaluationData;
    if (evaluationData && typeof evaluationData === 'object' && !Array.isArray(evaluationData) && Object.keys(evaluationData).length > 0) {
      finalEvaluationData = evaluationData;
    } else {
      // Use empty object instead of null to match model's defaultValue
      finalEvaluationData = {};
    }
    
    // Final validation: ensure at least one of evaluation or stars is provided
    const hasValidEvaluation = finalEvaluationData && typeof finalEvaluationData === 'object' && Object.keys(finalEvaluationData).length > 0;
    const hasValidStars = starsNum !== null && starsNum !== undefined && !isNaN(starsNum) && starsNum >= 1 && starsNum <= 5;
    
    if (!hasValidEvaluation && !hasValidStars) {
      logger.error('No valid rating data provided', {
        schoolId: finalSchoolId,
        parentId,
        evaluationData,
        starsNum,
        finalEvaluationData,
      });
      return res.status(400).json({ 
        error: 'Rating data required',
        message: 'Please provide either evaluation criteria or a star rating (1-5)'
      });
    }
    
    // Log for debugging
    logger.info('Preparing to save rating', {
      schoolId: finalSchoolId,
      parentId,
      hasEvaluation: hasValidEvaluation,
      evaluationKeys: hasValidEvaluation ? Object.keys(finalEvaluationData) : [],
      starsNum,
      finalEvaluationData,
    });

    try {
      // First, try to find existing rating (outside transaction for better error handling)
      // Use findOrCreate to handle unique constraint automatically
      let existingRating = await SchoolRating.findOne({
        where: {
          schoolId: finalSchoolId,
          parentId,
        },
      });

      if (existingRating) {
        // Update existing rating
        if (hasValidEvaluation) {
          // Has evaluation criteria
          existingRating.evaluation = finalEvaluationData;
          existingRating.stars = null; // Clear stars when using evaluation
        } else if (hasValidStars) {
          // Has stars, no evaluation
          existingRating.stars = starsNum;
          existingRating.evaluation = {}; // Use empty object to match model's defaultValue
        } else {
          // This shouldn't happen due to validation above, but handle it gracefully
          logger.warn('Unexpected: no valid evaluation or stars in update', {
            schoolId: finalSchoolId,
            parentId,
            finalEvaluationData,
            starsNum,
          });
          return res.status(400).json({ 
            error: 'Invalid rating data',
            message: 'Please provide either evaluation criteria or a star rating'
          });
        }
        existingRating.comment = comment || null;
        await existingRating.save();
        rating = existingRating;
        created = false;
      } else {
        // Create new rating
        // Prepare stars value - only set if no evaluation and starsNum is valid
        const starsValue = hasValidEvaluation 
          ? null 
          : (hasValidStars ? starsNum : null);
        
        // Final check before creating
        if (!hasValidEvaluation && !hasValidStars) {
          logger.error('Cannot create rating: no valid data', {
            schoolId: finalSchoolId,
            parentId,
            finalEvaluationData,
            starsNum,
          });
          return res.status(400).json({ 
            error: 'Invalid rating data',
            message: 'Please provide either evaluation criteria or a star rating'
          });
        }
        
        // Ensure evaluation is properly formatted for JSONB
        // Model has defaultValue: {} for evaluation, so use empty object instead of null
        let evaluationForDB = {};
        if (hasValidEvaluation && finalEvaluationData && typeof finalEvaluationData === 'object' && Object.keys(finalEvaluationData).length > 0) {
          try {
            // Deep clone to ensure it's a plain object
            evaluationForDB = JSON.parse(JSON.stringify(finalEvaluationData));
            // Validate that it's still an object after stringify/parse
            if (typeof evaluationForDB !== 'object' || Array.isArray(evaluationForDB)) {
              logger.warn('Evaluation data is not a valid object after stringify/parse', {
                original: finalEvaluationData,
                parsed: evaluationForDB,
              });
              evaluationForDB = {};
            }
          } catch (parseError) {
            logger.error('Error parsing evaluation data', {
              error: parseError.message,
              evaluationData: finalEvaluationData,
            });
            evaluationForDB = {};
          }
        }
        
        // Log before creating for debugging
        logger.info('Creating school rating', {
          schoolId: finalSchoolId,
          parentId,
          starsValue,
          evaluationForDB: JSON.stringify(evaluationForDB),
          hasValidEvaluation,
          hasValidStars,
        });
        
        // Use findOrCreate to handle unique constraint automatically
        // Wrap in try-catch to handle any errors during findOrCreate
        let ratingInstance;
        let wasCreated;
        
        try {
          [ratingInstance, wasCreated] = await SchoolRating.findOrCreate({
            where: {
              schoolId: finalSchoolId,
              parentId,
            },
            defaults: {
              stars: starsValue,
              evaluation: evaluationForDB,
              comment: comment || null,
            },
          });
        } catch (findOrCreateError) {
          // If findOrCreate fails, try to find and update manually
          logger.warn('findOrCreate failed, trying manual find and update', {
            error: findOrCreateError.message,
            schoolId: finalSchoolId,
            parentId,
          });
          
          ratingInstance = await SchoolRating.findOne({
            where: {
              schoolId: finalSchoolId,
              parentId,
            },
          });
          
          if (ratingInstance) {
            wasCreated = false;
          } else {
            // If not found, create manually
            ratingInstance = await SchoolRating.create({
              schoolId: finalSchoolId,
              parentId,
              stars: starsValue,
              evaluation: evaluationForDB,
              comment: comment || null,
            });
            wasCreated = true;
          }
        }
        
        if (!wasCreated && ratingInstance) {
          // Update existing rating
          if (hasValidEvaluation) {
            ratingInstance.evaluation = evaluationForDB;
            ratingInstance.stars = null;
          } else if (hasValidStars) {
            ratingInstance.stars = starsValue;
            ratingInstance.evaluation = {};
          }
          ratingInstance.comment = comment || null;
          await ratingInstance.save();
        }
        
        rating = ratingInstance;
        created = wasCreated;
      }
    } catch (ratingError) {
      // Log comprehensive error information
      const errorInfo = {
        error: ratingError.message,
        stack: ratingError.stack,
        schoolId: finalSchoolId,
        parentId,
        errorName: ratingError.name,
        errorCode: ratingError.code,
        errorDetails: ratingError.errors || ratingError.original?.detail || ratingError.original?.message,
        hasEvaluation: !!evaluationData,
        evaluationType: typeof evaluationData,
        starsNum,
        finalEvaluationData,
        sequelizeError: ratingError.original?.code || ratingError.original?.constraint,
        table: ratingError.table,
        constraint: ratingError.constraint,
      };
      
      logger.error('Error creating/updating school rating', errorInfo);
      
      // Handle specific database errors
      if (ratingError.name === 'SequelizeUniqueConstraintError') {
        // Try to update instead
        try {
          const existingRating = await SchoolRating.findOne({
            where: {
              schoolId: finalSchoolId,
              parentId,
            },
          });
          
          if (existingRating) {
            // Recalculate validation flags in error handling context
            const errorHasValidEvaluation = finalEvaluationData && typeof finalEvaluationData === 'object' && Object.keys(finalEvaluationData).length > 0;
            const errorHasValidStars = starsNum !== null && starsNum !== undefined && !isNaN(starsNum) && starsNum >= 1 && starsNum <= 5;
            
            if (errorHasValidEvaluation) {
              existingRating.evaluation = finalEvaluationData;
              existingRating.stars = null;
            } else if (errorHasValidStars) {
              existingRating.stars = starsNum;
              existingRating.evaluation = {}; // Use empty object to match model's defaultValue
            }
            existingRating.comment = comment || null;
            await existingRating.save();
            
            return res.json({
              success: true,
              message: 'School rating updated successfully',
              data: existingRating.toJSON(),
            });
          }
        } catch (updateError) {
          logger.error('Error updating existing rating after unique constraint error', {
            error: updateError.message,
            stack: updateError.stack,
          });
        }
        
        return res.status(409).json({ 
          error: 'Rating already exists for this school',
          message: 'You have already rated this school.',
        });
      }
      
      if (ratingError.name === 'SequelizeValidationError') {
        const validationErrors = ratingError.errors?.map(e => `${e.path}: ${e.message}`).join(', ') || ratingError.message;
        return res.status(400).json({ 
          error: 'Validation error',
          message: 'Invalid data provided',
          details: validationErrors,
        });
      }
      
      if (ratingError.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ 
          error: 'Invalid school or parent reference',
          message: 'The school or parent ID is invalid',
          details: process.env.NODE_ENV === 'development' ? ratingError.message : undefined,
        });
      }
      
      if (ratingError.name === 'SequelizeDatabaseError') {
        // Log detailed database error
        logger.error('Database error details', {
          message: ratingError.message,
          originalMessage: ratingError.original?.message,
          code: ratingError.original?.code,
          detail: ratingError.original?.detail,
          hint: ratingError.original?.hint,
          position: ratingError.original?.position,
          internalPosition: ratingError.original?.internalPosition,
          internalQuery: ratingError.original?.internalQuery,
          where: ratingError.original?.where,
          schema: ratingError.original?.schema,
          table: ratingError.original?.table,
          column: ratingError.original?.column,
          dataType: ratingError.original?.dataType,
          constraint: ratingError.original?.constraint,
          file: ratingError.original?.file,
          line: ratingError.original?.line,
          routine: ratingError.original?.routine,
        });
        
        // Check for specific database errors
        const originalMessage = ratingError.original?.message || ratingError.message || '';
        
        // Handle null constraint violations
        if (originalMessage.includes('null value') || originalMessage.includes('NOT NULL')) {
          return res.status(400).json({ 
            error: 'Validation error',
            message: 'Required fields are missing. Please check your input.',
            details: process.env.NODE_ENV === 'development' ? originalMessage : undefined,
          });
        }
        
        // Handle foreign key violations
        if (originalMessage.includes('foreign key') || originalMessage.includes('violates foreign key')) {
          return res.status(400).json({ 
            error: 'Invalid reference',
            message: 'The school or parent reference is invalid.',
            details: process.env.NODE_ENV === 'development' ? originalMessage : undefined,
          });
        }
        
        // Handle unique constraint violations (shouldn't happen due to transaction, but just in case)
        if (originalMessage.includes('unique constraint') || originalMessage.includes('duplicate key')) {
          // Try to update instead
          try {
            const existingRating = await SchoolRating.findOne({
              where: {
                schoolId: finalSchoolId,
                parentId,
              },
            });
            
            if (existingRating) {
              // Recalculate validation flags in error handling context
              const errorHasValidEvaluation = finalEvaluationData && typeof finalEvaluationData === 'object' && Object.keys(finalEvaluationData).length > 0;
              const errorHasValidStars = starsNum !== null && starsNum !== undefined && !isNaN(starsNum) && starsNum >= 1 && starsNum <= 5;
              
              if (errorHasValidEvaluation) {
                existingRating.evaluation = finalEvaluationData;
                existingRating.stars = null;
              } else if (errorHasValidStars) {
                existingRating.stars = starsNum;
                existingRating.evaluation = {}; // Use empty object to match model's defaultValue
              }
              existingRating.comment = comment || null;
              await existingRating.save();
              
              return res.json({
                success: true,
                message: 'School rating updated successfully',
                data: existingRating.toJSON(),
              });
            }
          } catch (updateError) {
            logger.error('Error updating existing rating after database error', {
              error: updateError.message,
              stack: updateError.stack,
            });
          }
        }
        
        return res.status(500).json({ 
          error: 'Database error',
          message: 'A database error occurred. Please try again.',
          details: process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production' ? {
            message: ratingError.message,
            originalMessage: ratingError.original?.message,
            code: ratingError.original?.code,
            detail: ratingError.original?.detail,
            hint: ratingError.original?.hint,
            errorName: ratingError.name,
            stack: ratingError.stack,
          } : undefined,
        });
      }
      
      // Return more helpful error message
      let errorMessage = 'Failed to save school rating';
      if (ratingError.message) {
        errorMessage = ratingError.message;
      }
      
      return res.status(500).json({ 
        error: errorMessage,
        message: 'An error occurred while saving your rating. Please try again.',
        details: process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production' ? {
          originalError: ratingError.message,
          errorName: ratingError.name,
          errorCode: ratingError.code,
          originalMessage: ratingError.original?.message,
          detail: ratingError.original?.detail,
          hint: ratingError.original?.hint,
          stack: ratingError.stack,
          schoolId: finalSchoolId,
          parentId,
          finalEvaluationData,
          starsNum,
        } : undefined,
      });
    }

    // School rating summary is calculated on-the-fly from SchoolRating table
    // No need to update School model as it doesn't have averageRating field
    // The summary is calculated when needed in getMySchoolRating endpoint

    logger.info('School rating saved', {
      schoolId: finalSchoolId,
      parentId,
      hasEvaluation: !!evaluationData,
      stars: starsNum,
      created,
      ratingId: rating.id,
    });

    res.json({
      success: true,
      message: created ? 'School rating created successfully' : 'School rating updated successfully',
      data: rating.toJSON(),
    });
  } catch (error) {
    logger.error('Rate school error', { 
      error: error.message, 
      stack: error.stack,
      body: req.body,
      parentId: req.user?.id,
      errorName: error.name,
      errorCode: error.code,
    });
    res.status(500).json({ 
      error: 'Failed to rate school',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get my school rating
 * GET /api/parent/school-rating?childId=xxx
 */
export const getMySchoolRating = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { childId } = req.query;

    let child = null;

    // If childId is provided, get that specific child
    if (childId) {
      child = await Child.findOne({
        where: {
          id: childId,
          parentId, // Ensure child belongs to this parent
        },
        include: [
          {
            model: School,
            as: 'childSchool',
            required: false,
          },
        ],
      });

      if (!child) {
        return res.status(404).json({
          success: false,
          error: 'Child not found or does not belong to you',
        });
      }
    } else {
      // If no childId, get parent's children to find their schools
      const children = await Child.findAll({
        where: { parentId },
        include: [
          {
            model: School,
            as: 'childSchool',
            required: false,
          },
        ],
      });

      if (children.length === 0) {
        return res.json({
          success: true,
          data: {
            rating: null,
            school: null,
            summary: { average: 0, count: 0 },
          },
        });
      }

      // Get school from first child (fallback to first child if no childId)
      child = children[0];
    }
    let school = null;
    let schoolId = null;

    if (child.schoolId) {
      schoolId = child.schoolId;
      school = child.childSchool;
    } else if (child.school && typeof child.school === 'string' && child.school.trim().length > 0) {
      // Find school by name (case-insensitive search)
      school = await School.findOne({
        where: {
          name: {
            [Op.iLike]: child.school,
          },
        },
      });
      
      if (school) {
        schoolId = school.id;
        // Update child's schoolId for future use
        try {
          await child.update({ schoolId: school.id });
        } catch (err) {
          logger.warn('Failed to update child schoolId', { childId: child.id, schoolId: school.id, error: err.message });
        }
      } else {
        // If school not found by exact name, try partial match
        const partialMatch = await School.findOne({
          where: {
            name: {
              [Op.iLike]: `%${child.school}%`,
            },
          },
        });
        
        if (partialMatch) {
          school = partialMatch;
          schoolId = partialMatch.id;
          // Update child's schoolId
          try {
            await child.update({ schoolId: partialMatch.id });
          } catch (err) {
            logger.warn('Failed to update child schoolId', { childId: child.id, schoolId: partialMatch.id, error: err.message });
          }
        }
      }
    }

    // If school not found but child has school name, return school name for display
    if (!schoolId && child?.school && typeof child.school === 'string' && child.school.trim().length > 0) {
      logger.info('School not found in database, returning school name from child', {
        childId: child?.id,
        childSchool: child.school,
        parentId,
      });
      return res.json({
        success: true,
        data: {
          rating: null,
          school: {
            id: null,
            name: child.school,
            address: null,
            phone: null,
            email: null,
            type: null,
          },
          summary: { average: 0, count: 0 },
          allRatings: [],
        },
      });
    }

    if (!schoolId) {
      return res.json({
        success: true,
        data: {
          rating: null,
          school: null,
          summary: { average: 0, count: 0 },
          allRatings: [],
        },
      });
    }

    // Get parent's rating for this school
    let rating = null;
    try {
      rating = await SchoolRating.findOne({
        where: {
          schoolId,
          parentId,
        },
      });
    } catch (ratingError) {
      logger.error('Error fetching parent school rating', {
        error: ratingError.message,
        stack: ratingError.stack,
        schoolId,
        parentId,
      });
      rating = null; // Continue with null rating if fetch fails
    }

    // Get all ratings for this school with parent info
    let allRatings = [];
    try {
      allRatings = await SchoolRating.findAll({
        where: { schoolId },
        include: [
          {
            model: User,
            as: 'ratingParent',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
        ],
        order: [['updatedAt', 'DESC']],
      });
    } catch (ratingsError) {
      logger.error('Error fetching school ratings', {
        error: ratingsError.message,
        stack: ratingsError.stack,
        schoolId,
      });
      allRatings = []; // Default to empty array if fetch fails
    }

    // Calculate average rating using the utility function
    let average = 0;
    let count = 0;
    
    if (allRatings.length > 0) {
      try {
        const ratingResult = computeAverageRating(allRatings);
        average = ratingResult.average;
        count = ratingResult.count;
      } catch (calcError) {
        logger.error('Error calculating school rating average', {
          error: calcError.message,
          stack: calcError.stack,
          schoolId,
          ratingsCount: count,
        });
        average = 0; // Default to 0 if calculation fails
      }
    }

    // Format ratings with parent names
    let formattedRatings = [];
    try {
      formattedRatings = allRatings.map((r) => {
        try {
          return {
            ...r.toJSON(),
            parentName: r.ratingParent
              ? `${r.ratingParent.firstName || ''} ${r.ratingParent.lastName || ''}`.trim()
              : null,
            parentEmail: r.ratingParent?.email || null,
          };
        } catch (mapError) {
          logger.warn('Error formatting rating', {
            error: mapError.message,
            ratingId: r?.id,
          });
          return r.toJSON(); // Return basic rating if formatting fails
        }
      });
    } catch (formatError) {
      logger.error('Error formatting ratings', {
        error: formatError.message,
        stack: formatError.stack,
      });
      formattedRatings = allRatings.map(r => r.toJSON()); // Fallback to basic JSON
    }

    logger.info('Get school rating response', {
      parentId,
      childId: child?.id,
      schoolId,
      schoolName: school?.name || child?.school || 'Unknown',
      hasRating: !!rating,
      ratingsCount: count,
    });

    res.json({
      success: true,
      data: {
        rating: rating ? rating.toJSON() : null,
        school: school ? school.toJSON() : null,
        summary: {
          average: isNaN(average) ? 0 : Number(average),
          count,
        },
        allRatings: formattedRatings,
      },
    });
  } catch (error) {
    logger.error('Get school rating error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch school rating' });
  }
};

/**
 * Get all schools (for parent to select)
 * GET /api/parent/schools
 */
export const getSchools = async (req, res) => {
  try {
    const schools = await School.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: schools.map(s => s.toJSON()),
    });
  } catch (error) {
    logger.error('Get schools error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
};

export const getAIAdvice = async (req, res) => {
  try {
    const { message, childInfo } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get parent's children info for context
    const children = await Child.findAll({
      where: { parentId: req.user.id },
      attributes: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'disabilityType', 'specialNeeds'],
      limit: 1,
    });

    const child = children.length > 0 ? children[0] : null;

    // Prepare context for AI
    const context = {
      parentName: `${req.user.firstName} ${req.user.lastName}`,
      child: child ? {
        name: `${child.firstName} ${child.lastName}`,
        age: child.dateOfBirth ? Math.floor((new Date() - new Date(child.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        gender: child.gender,
        disabilityType: child.disabilityType,
        specialNeeds: child.specialNeeds,
      } : null,
      message: message.trim(),
    };

    // Determine preferred language from headers (fallback to en)
    const acceptLanguage = req.headers['accept-language'] || '';
    const requestedLang = (req.body?.lang || '').toLowerCase();
    const langCode = (requestedLang || acceptLanguage.split(',')[0]?.split('-')[0] || 'en').toLowerCase();
    const languageName = {
      uz: 'Uzbek',
      ru: 'Russian',
      en: 'English',
    }[langCode] || 'English';

    // Build prompts once (used for primary call and free-model fallback)
    const systemPrompt = `You are a helpful, conversational AI assistant specialized in providing advice to parents of children with special needs and disabilities. 
You provide practical, empathetic, and evidence-based advice about:
- How to care for children with disabilities at home
- Daily routines and activities
- Nutrition and meal planning
- Communication strategies
- Behavioral support
- Emotional support for both children and parents
- Safety considerations
- Educational activities at home

Always respond in a warm, supportive, and professional manner. If the parent mentions their child's specific disability type or special needs, incorporate that into your advice.
Keep responses concise (2-4 sentences) in ${languageName}. You may ask one brief follow-up question if it helps clarify, but stay short. Do not switch languages. If ${languageName} is Russian, respond in Cyrillic Russian. If ${languageName} is Uzbek, respond in Uzbek. Never answer in English unless ${languageName} is English.`;

    const userPrompt = child
      ? `Parent: ${context.parentName}
Child: ${context.child.name} (${context.child.age} years old, ${context.child.gender})
Disability Type: ${context.child.disabilityType || 'Not specified'}
Special Needs: ${context.child.specialNeeds || 'None specified'}

Parent's Question: ${context.message}

Please provide helpful, practical advice.`
      : `Parent: ${context.parentName}

Parent's Question: ${context.message}

Please provide helpful, practical advice about caring for children with special needs.`;

    // Build chat history (if provided) to enable conversation
    const incomingMessages = Array.isArray(req.body?.messages) ? req.body.messages : null;
    const sanitizedHistory = (incomingMessages || [])
      .filter(m => m && m.role && m.content)
      .slice(-8) // keep last 8 exchanges
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content).slice(0, 4000), // guard length
      }));

    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...(sanitizedHistory.length
        ? sanitizedHistory
        : [{ role: 'user', content: userPrompt }]),
    ];

    // Try to use OpenAI/OpenRouter API if available
    let aiResponse;
    const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0;
    const isOpenRouter = process.env.OPENAI_BASE_URL && process.env.OPENAI_BASE_URL.includes('openrouter.ai');
    
    logger.info('AI chat request', {
      parentId: req.user.id,
      hasOpenAIKey,
      isOpenRouter,
      messageLength: message.trim().length,
    });
    
    if (hasOpenAIKey) {
      try {
        const OpenAI = (await import('openai')).default;
        const openaiConfig = {
          apiKey: process.env.OPENAI_API_KEY,
        };
        
        // If OpenRouter base URL is provided, use it
        if (isOpenRouter) {
          openaiConfig.baseURL = process.env.OPENAI_BASE_URL;
          // OpenRouter requires HTTP headers
          openaiConfig.defaultHeaders = {
            'HTTP-Referer': process.env.FRONTEND_URL?.split(',')[0] || 'https://uchqun-production.up.railway.app',
            'X-Title': 'Uchqun Parent Portal',
          };
        }
        
        const openai = new OpenAI(openaiConfig);

        // Determine model to use
        let modelToUse = process.env.OPENAI_MODEL;
        
        // If using OpenRouter and no specific model set, use a free model
        if (isOpenRouter && !modelToUse) {
          // Try free models available on OpenRouter
          modelToUse = 'qwen/qwen-2.5-7b-instruct:free';
        }

        const completion = await openai.chat.completions.create({
          model: modelToUse,
          messages: openaiMessages,
          temperature: 0.7,
          max_tokens: 500,
        });

        aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
        
        logger.info('OpenAI API response generated successfully', {
          parentId: req.user.id,
          messageLength: context.message.length,
          responseLength: aiResponse.length,
          model: modelToUse,
        });
      } catch (openaiError) {
        logger.error('OpenAI API error', { 
          error: openaiError.message,
          stack: openaiError.stack,
          parentId: req.user.id,
          isOpenRouter,
        });
        
        // If OpenRouter and insufficient credits or model not found, try to get available models
        if (isOpenRouter && (openaiError.message.includes('402') || openaiError.message.includes('404') || openaiError.message.includes('credits'))) {
          // Try to fetch available models from OpenRouter API
          try {
            logger.info('Fetching available models from OpenRouter');
            const response = await fetch('https://openrouter.ai/api/v1/models', {
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'HTTP-Referer': process.env.FRONTEND_URL?.split(',')[0] || 'https://uchqun-production.up.railway.app',
                'X-Title': 'Uchqun Parent Portal',
              },
            });
            
            if (response.ok) {
              const modelsData = await response.json();
              const freeModels = modelsData.data
                ?.filter(model => model.pricing?.prompt === '0' || model.id.includes(':free'))
                ?.map(model => model.id)
                ?.slice(0, 5) || [];
              
              logger.info(`Found ${freeModels.length} free models on OpenRouter`, { models: freeModels });
              
              // Try free models
              for (const freeModel of freeModels) {
                try {
                  logger.info(`Trying free OpenRouter model: ${freeModel}`);
                  const OpenAI = (await import('openai')).default;
                  const openaiFree = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY,
                    baseURL: process.env.OPENAI_BASE_URL,
                    defaultHeaders: {
                      'HTTP-Referer': process.env.FRONTEND_URL?.split(',')[0] || 'https://uchqun-production.up.railway.app',
                      'X-Title': 'Uchqun Parent Portal',
                    },
                  });

                  const freeCompletion = await openaiFree.chat.completions.create({
                    model: freeModel,
                    messages: openaiMessages,
                    temperature: 0.7,
                    max_tokens: 500,
                  });

                  aiResponse = freeCompletion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
                  
                  logger.info('Free OpenRouter model response generated successfully', {
                    parentId: req.user.id,
                    responseLength: aiResponse.length,
                    model: freeModel,
                  });
                  break; // Success, exit loop
                } catch (freeModelError) {
                  logger.warn(`Free model ${freeModel} failed`, { 
                    error: freeModelError.message,
                  });
                  // Continue to next model
                }
              }
              
              // If no free models worked, use fallback
              if (!aiResponse || aiResponse === 'I apologize, but I could not generate a response. Please try again.') {
                logger.warn('No free models worked, using fallback');
                aiResponse = generateFallbackResponse(context);
              }
            } else {
              logger.warn('Could not fetch OpenRouter models, using fallback');
              aiResponse = generateFallbackResponse(context);
            }
          } catch (fetchError) {
            logger.error('Error fetching OpenRouter models', { error: fetchError.message });
            // Fallback to rule-based response
            aiResponse = generateFallbackResponse(context);
          }
        } else {
          // Fallback to rule-based response
          aiResponse = generateFallbackResponse(context);
        }
      }
    } else {
      // Fallback to rule-based response if OpenAI is not configured
      aiResponse = generateFallbackResponse(context);
    }

    res.json({
      success: true,
      data: {
        message: context.message,
        response: aiResponse,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Get AI advice error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to get AI advice' });
  }
};

/**
 * Generate fallback response when OpenAI is not available
 */
function generateFallbackResponse(context) {
  const message = context.message.toLowerCase();
  const child = context.child;

  // Basic keyword-based responses
  if (message.includes('uy') || message.includes('home') || message.includes('qanday qarash') || message.includes('care')) {
    return `Uyda bolangizni parvarish qilish uchun quyidagi maslahatlarni amalga oshirishingiz mumkin:

1. **Kun tartibi yarating**: Har kuni bir xil vaqtda uyg'onish, ovqatlanish va uxlash vaqtlarini belgilang. Bu bolangizga tushunish va kutilishni o'rgatadi.

2. **Xavfsiz muhit yarating**: Uy atrofida xavfsizlikni ta'minlang - burchaklar, o'tkir narsalar va xavfli materiallarni olib tashlang.

3. **Muloqotni rag'batlantiring**: Bolangiz bilan muntazam ravishda gaplashing, ertak o'qing va qo'shiq aytib bering. Bu til rivojlanishiga yordam beradi.

4. **Faol o'yinlar**: Bolangizning yoshiga va qobiliyatlariga mos o'yinlar va mashg'ulotlar tashkil qiling.

5. **Sabr va muhabbat**: Eng muhimi - bolangizga sabr va muhabbat bilan yondashing. Har bir kichik yutuqni nishonlang.

Agar bolangizning maxsus ehtiyojlari bo'lsa, ularni hisobga oling va tegishli mutaxassislar bilan maslahatlashing.`;
  }

  if (message.includes('nogiron') || message.includes('disability') || message.includes('maxsus')) {
    return `Nogironligi bor bolani parvarish qilishda quyidagilarni yodda tuting:

1. **Individual yondashuv**: Har bir bola boshqacha, shuning uchun bolangizning ehtiyojlariga mos yondashuvni toping.

2. **Professional yordam**: Mutaxassislar (logoped, psixolog, fizioterapevt) bilan muntazam aloqada bo'ling.

3. **Mashg'ulotlar**: Uyda professional tavsiyalar asosida mashg'ulotlar o'tkazing.

4. **Oilaviy qo'llab-quvvatlash**: Barcha oila a'zolari bolangizni qo'llab-quvvatlashda ishtirok etishi kerak.

5. **O'z-o'ziga g'amxo'rlik**: O'zingizga ham vaqt ajrating - dam oling va qo'llab-quvvatlovchi oila a'zolari yoki do'stlar bilan aloqada bo'ling.

6. **Muvaffaqiyatlarni nishonlash**: Kichik yutuqlarni ham katta muvaffaqiyat sifatida qabul qiling.

Agar aniq savollaringiz bo'lsa, mutaxassislar bilan maslahatlashing.`;
  }

  if (message.includes('ovqat') || message.includes('meal') || message.includes('nutrition') || message.includes('parvarish')) {
    return `Bolangizning ovqatlanishi uchun maslahatlar:

1. **Muntazam ovqatlanish**: Kuniga 3-4 marta muntazam ovqat berish bolangizning sog'lig'i uchun muhim.

2. **Balanslangan ovqat**: Meva, sabzavot, protein va karbohidratlarni muvozanatlashtiring.

3. **Maxsus ehtiyojlar**: Agar bolangizning allergiyasi yoki maxsus dietasi bo'lsa, uni qat'iy rioya qiling.

4. **Sabr**: Ba'zi bolalar ovqatlanishda qiyinchiliklarga duch kelishi mumkin. Sabr bilan yondashing.

5. **Ijodkorlik**: Ovqatni qiziqarli va jozibali qilib taqdim eting - rangli idishlar, qiziqarli shakllar.

Agar ovqatlanish bilan bog'liq muammolaringiz bo'lsa, dietolog yoki pediatr bilan maslahatlashing.`;
  }

  // Default response
  return `Rahmat, savolingizni qabul qildim. Bolangizni uyda parvarish qilish haqida quyidagi umumiy maslahatlarni berishim mumkin:

1. **Muntazam kun tartibi**: Har kuni bir xil vaqtda uyg'onish, ovqatlanish va uxlash vaqtlarini belgilang.

2. **Xavfsiz muhit**: Uy atrofida xavfsizlikni ta'minlang va bolangizning yoshiga mos o'yinchoqlar va materiallar tayyorlang.

3. **Muloqot va o'yin**: Bolangiz bilan muntazam ravishda gaplashing, ertak o'qing va o'yinlar o'tkazing.

4. **Professional yordam**: Mutaxassislar bilan muntazam aloqada bo'ling va ularning tavsiyalarini amalga oshiring.

5. **Sabr va muhabbat**: Eng muhimi - bolangizga sabr va muhabbat bilan yondashing.

Agar aniq savollaringiz bo'lsa, iltimos, batafsilroq yozing va men sizga yanada aniq maslahat beraman.`;
}

/**
 * Get parent's messages to super-admin
 * GET /api/parent/messages
 * 
 * Business Logic:
 * - Parents can view their own messages sent to super-admin
 * - Includes replies from super-admin
 */
export const getMyMessages = async (req, res) => {
  try {
    const messages = await SuperAdminMessage.findAll({
      where: { senderId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: messages.map(m => m.toJSON()),
    });
  } catch (error) {
    logger.error('Get my messages error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

