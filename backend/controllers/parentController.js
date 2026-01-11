import User from '../models/User.js';
import Group from '../models/Group.js';
import ParentActivity from '../models/ParentActivity.js';
import ParentMeal from '../models/ParentMeal.js';
import ParentMedia from '../models/ParentMedia.js';
import Child from '../models/Child.js';
import TeacherRating from '../models/TeacherRating.js';
import logger from '../utils/logger.js';
import { Op, fn, col } from 'sequelize';

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
 * Get parent's own activities
 * GET /api/parent/activities
 * 
 * Business Logic:
 * - Parents can only view their own activities
 * - When viewing parent list, clicking on a parent shows their activities
 */
export const getMyActivities = async (req, res) => {
  try {
    const { limit = 50, offset = 0, activityType, startDate, endDate } = req.query;

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
 * Get parent's own meals
 * GET /api/parent/meals
 * 
 * Business Logic:
 * - Parents can only view their own meals
 * - When viewing parent list, clicking on a parent shows their meals
 */
export const getMyMeals = async (req, res) => {
  try {
    const { limit = 50, offset = 0, mealType, startDate, endDate } = req.query;

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
 * Get parent's own media
 * GET /api/parent/media
 * 
 * Business Logic:
 * - Parents can only view their own media
 * - When viewing parent list, clicking on a parent shows their media
 */
export const getMyMedia = async (req, res) => {
  try {
    const { limit = 50, offset = 0, fileType } = req.query;

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

    res.json({
      success: true,
      data: rating.toJSON(),
    });
  } catch (error) {
    logger.error('Rate teacher error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to rate teacher' });
  }
};

/**
 * Get parent's current rating and teacher average
 * GET /api/parent/ratings
 */
export const getMyRating = async (req, res) => {
  try {
    const parent = await User.findByPk(req.user.id);

    if (!parent || !parent.teacherId) {
      return res.status(400).json({ error: 'Assigned teacher not found' });
    }

    const rating = await TeacherRating.findOne({
      where: { teacherId: parent.teacherId, parentId: req.user.id },
    });

    const summaryRaw = await TeacherRating.findOne({
      where: { teacherId: parent.teacherId },
      attributes: [
        [fn('AVG', col('stars')), 'averageStars'],
        [fn('COUNT', col('id')), 'totalRatings'],
      ],
      raw: true,
    });

    const average = summaryRaw?.averageStars
      ? Number(parseFloat(summaryRaw.averageStars).toFixed(2))
      : 0;
    const count = summaryRaw?.totalRatings ? Number(summaryRaw.totalRatings) : 0;

    res.json({
      success: true,
      data: {
        rating: rating ? rating.toJSON() : null,
        summary: {
          average,
          count,
        },
      },
    });
  } catch (error) {
    logger.error('Get rating error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch rating' });
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
            'HTTP-Referer': process.env.FRONTEND_URL?.split(',')[0] || 'https://uchqun-production-4f83.up.railway.app',
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
                'HTTP-Referer': process.env.FRONTEND_URL?.split(',')[0] || 'https://uchqun-production-4f83.up.railway.app',
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
                      'HTTP-Referer': process.env.FRONTEND_URL?.split(',')[0] || 'https://uchqun-production-4f83.up.railway.app',
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

