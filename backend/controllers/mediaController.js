import { Op } from 'sequelize';
import Media from '../models/Media.js';
import Child from '../models/Child.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { uploadFile, deleteFile } from '../config/storage.js';
import { createNotification } from './notificationController.js';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

// sharp is loaded dynamically to avoid startup crashes in containers
let sharpModule = null;
async function getSharp() {
  if (!sharpModule) {
    try {
      sharpModule = (await import('sharp')).default;
    } catch (error) {
      console.warn('Sharp module not available, thumbnails will be skipped:', error.message);
      return null;
    }
  }
  return sharpModule;
}

// Normalize media output: keep URL as-is, drop thumbnail
function sanitizeMediaUrls(media) {
  const data = media.toJSON ? media.toJSON() : media;
  return {
    ...data,
    thumbnail: null,
  };
}

export const getMedia = async (req, res) => {
  try {
    const { type, limit, offset, date, childId } = req.query;
    const limitNum = limit ? parseInt(limit) : undefined;
    const offsetNum = offset ? parseInt(offset) : 0;

    const where = {};
    
    // If user is teacher, show only media for children of assigned parents
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
        // Show media for all assigned children
        where.childId = { [Op.in]: childIds };
      }
    } else if (req.user.role === 'admin') {
      // Admin can see all media
      if (childId) {
        where.childId = childId;
      }
      // If no childId, show all media
    } else {
      // For parents, show media for all their children or filter by childId
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
        // Show media for all children
        where.childId = { [Op.in]: childIds };
      }
    }
    
    if (type) {
      where.type = type;
    }

    if (date) {
      where.date = date;
    }

    const media = await Media.findAll({
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
        {
          model: Activity,
          as: 'activity',
          attributes: ['id', 'title', 'date'],
        },
      ],
    });

    const sanitized = Array.isArray(media) ? media.map(sanitizeMediaUrls) : [];
    res.json(sanitized);
  } catch (error) {
    logger.error('Get media error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to get media' });
  }
};

export const getMediaItem = async (req, res) => {
  try {
    const { id } = req.params;

    const where = { id };
    
    // If user is teacher, only show media for children of assigned parents
    if (req.user.role === 'teacher') {
      // Get all parents assigned to this teacher
      const assignedParents = await User.findAll({
        where: { teacherId: req.user.id },
        attributes: ['id'],
      });
      
      if (assignedParents.length === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }
      
      const parentIds = assignedParents.map(p => p.id);
      
      // Get all children of assigned parents
      const children = await Child.findAll({
        where: { parentId: { [Op.in]: parentIds } },
        attributes: ['id'],
      });
      
      if (children.length === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }
      
      const childIds = children.map(c => c.id);
      where.childId = { [Op.in]: childIds };
    } else if (req.user.role === 'admin') {
      // Admin can see all media - no filter needed
    } else {
      const children = await Child.findAll({
        where: { parentId: req.user.id },
        attributes: ['id'],
      });

      if (children.length === 0) {
        return res.status(404).json({ error: 'Child not found' });
      }

      const childIds = children.map(c => c.id);
      where.childId = { [Op.in]: childIds };
    }

    const mediaItem = await Media.findOne({
      where,
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Activity,
          as: 'activity',
          attributes: ['id', 'title', 'date', 'description'],
        },
      ],
    });

    if (!mediaItem) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json(sanitizeMediaUrls(mediaItem));
  } catch (error) {
    logger.error('Get media item error', { error: error.message, stack: error.stack, mediaId: req.params.id });
    res.status(500).json({ error: 'Failed to get media item' });
  }
};

// Generate thumbnail for image
async function generateThumbnail(filePath, filename) {
  try {
    const sharp = await getSharp();
    if (!sharp) {
      logger.warn('Sharp not available, skipping thumbnail generation', { filename });
      return null;
    }

    const thumbnailName = `thumb_${filename}`;
    const thumbnailPath = path.join(path.dirname(filePath), thumbnailName);

    await sharp(filePath)
      .resize(300, 300, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(thumbnailPath);

    // Upload thumbnail to storage
    const thumbnailBuffer = fs.readFileSync(thumbnailPath);
    const thumbnailResult = await uploadFile(thumbnailBuffer, thumbnailName, 'image/jpeg');

    // Delete local thumbnail file
    fs.unlinkSync(thumbnailPath);

    return thumbnailResult.url;
  } catch (error) {
    logger.warn('Error generating thumbnail', { error: error.message, filename });
    return null;
  }
}

// Upload media file (teachers only)
// Helper to clean temp file safely
function safeCleanup(filePath) {
  if (!filePath) return;
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    logger.warn('Error cleaning up temp file', { error: e.message, path: filePath });
  }
}

export const uploadMedia = async (req, res) => {
  try {
    const appwriteConfigured = Boolean(
      process.env.APPWRITE_ENDPOINT &&
      process.env.APPWRITE_PROJECT_ID &&
      process.env.APPWRITE_API_KEY &&
      process.env.APPWRITE_BUCKET_ID
    );

    if (!appwriteConfigured) {
      return res.status(503).json({
        error: 'Storage not configured',
        message: 'Appwrite storage is required for media uploads. Please configure APPWRITE_* variables.',
      });
    }

    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'reception') {
      return res.status(403).json({ error: 'Only teachers, admins, and reception can upload media' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { childId, activityId, title, description, date } = req.body;

    // Validate required fields
    if (!childId) {
      // Clean up uploaded file
      if (req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          logger.warn('Error deleting file during cleanup', { error: e.message, path: req.file?.path });
        }
      }
      return res.status(400).json({ error: 'Child ID is required' });
    }

    if (!title) {
      // Clean up uploaded file
      if (req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          logger.warn('Error deleting file during cleanup', { error: e.message, path: req.file?.path });
        }
      }
      return res.status(400).json({ error: 'Title is required' });
    }

    // Determine media type from mimetype
    const isImage = req.file.mimetype.startsWith('image/');
    const isVideo = req.file.mimetype.startsWith('video/');
    const mediaType = isImage ? 'photo' : isVideo ? 'video' : null;

    if (!mediaType) {
      // Clean up uploaded file
      if (req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          logger.warn('Error deleting file during cleanup', { error: e.message, path: req.file?.path });
        }
      }
      return res.status(400).json({ error: 'Invalid file type. Only images and videos are allowed.' });
    }

    // Verify child exists
    const child = await Child.findByPk(childId);
    if (!child) {
      // Clean up uploaded file
      if (req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          logger.warn('Error deleting file during cleanup', { error: e.message, path: req.file?.path });
        }
      }
      return res.status(404).json({ error: 'Child not found' });
    }

    // Validate activity if provided
    if (activityId) {
      const activity = await Activity.findByPk(activityId);
      if (!activity) {
        // Clean up uploaded file
        if (req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            console.error('Error deleting file:', e);
          }
        }
        return res.status(404).json({ error: 'Activity not found' });
      }
    }

    // Upload file to Appwrite storage (single URL persisted)
    const fileBuffer = fs.readFileSync(req.file.path);
    let uploadResult;
    try {
      uploadResult = await uploadFile(fileBuffer, req.file.filename, req.file.mimetype);
    } catch (err) {
      safeCleanup(req.file.path);
      logger.error('Storage upload failed', { error: err.message, stack: err.stack });
      return res.status(502).json({
        error: 'Storage upload failed',
        message: 'Failed to upload file to Appwrite storage. Check Appwrite credentials, bucket permissions, and endpoint connectivity.',
        details: err.message,
      });
    }

    // Always cleanup temp file after upload regardless of storage target
    safeCleanup(req.file.path);

    // Create media record
    const media = await Media.create({
      childId,
      activityId: activityId || null,
      type: mediaType,
      url: uploadResult.url,   // store only the Appwrite file URL
      thumbnail: null,         // no thumbnails persisted
      title,
      description: description || '',
      date: date || new Date().toISOString().split('T')[0],
    });

    const createdMedia = await Media.findByPk(media.id, {
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Activity,
          as: 'activity',
          attributes: ['id', 'title', 'date'],
        },
      ],
    });

    // Create notification for parent
    if (child.parentId) {
      const mediaTypeText = mediaType === 'photo' ? 'rasm' : 'video';
      await createNotification(
        child.parentId,
        childId,
        'media',
        `Yangi ${mediaTypeText} qo'shildi`,
        `${child.firstName} uchun "${title}" ${mediaTypeText} qo'shildi`,
        media.id,
        'media'
      );
    }

    // Frontend expects the full media object with url field
    const sanitized = sanitizeMediaUrls(createdMedia);
    res.status(201).json(sanitized);
  } catch (error) {
    logger.error('Upload media error', { error: error.message, stack: error.stack, userId: req.user?.id });
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      safeCleanup(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to upload media' });
  }
};

// Create media (teachers only) - URL-based (legacy support)
export const createMedia = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'reception') {
      return res.status(403).json({ error: 'Only teachers, admins, and reception can create media' });
    }

    const { childId, activityId, type, url, title, description, date } = req.body;

    // Validate required fields
    if (!childId) {
      return res.status(400).json({ error: 'Child ID is required' });
    }
    if (!type || (type !== 'photo' && type !== 'video')) {
      return res.status(400).json({ error: 'Type must be "photo" or "video"' });
    }
    if (!url) {
      return res.status(400).json({ error: 'Media URL is required' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Verify child exists
    const child = await Child.findByPk(childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found. Please select a valid child.' });
    }

    // Validate activity if provided
    if (activityId) {
      const activity = await Activity.findByPk(activityId);
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found' });
      }
    }

    const media = await Media.create({
      childId,
      activityId: activityId || null,
      type,
      url,
      thumbnail: null,
      title,
      description: description || '',
      date,
    });

    const createdMedia = await Media.findByPk(media.id, {
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Activity,
          as: 'activity',
          attributes: ['id', 'title', 'date'],
        },
      ],
    });

    // Create notification for parent
    if (child.parentId) {
      const mediaTypeText = type === 'photo' ? 'rasm' : 'video';
      await createNotification(
        child.parentId,
        childId,
        'media',
        `Yangi ${mediaTypeText} qo'shildi`,
        `${child.firstName} uchun "${title}" ${mediaTypeText} qo'shildi`,
        media.id,
        'media'
      );
    }

    res.status(201).json(createdMedia);
  } catch (error) {
    logger.error('Create media error', { error: error.message, stack: error.stack });
    
    // Provide more specific error messages
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors.map(e => e.message),
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Invalid child ID. Please select a valid child.',
      });
    }

    const errorMessage = error.message || 'Failed to create media';
    res.status(500).json({ error: errorMessage });
  }
};

// Update media (teachers only)
export const updateMedia = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'reception') {
      return res.status(403).json({ error: 'Only teachers, admins, and reception can update media' });
    }

    const { id } = req.params;
    const media = await Media.findByPk(id);

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const payload = { ...req.body };
    delete payload.thumbnail;
    await media.update(payload);

    const updatedMedia = await Media.findByPk(id, {
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Activity,
          as: 'activity',
          attributes: ['id', 'title', 'date'],
        },
      ],
    });

    res.json(updatedMedia);
  } catch (error) {
    logger.error('Update media error', { error: error.message, stack: error.stack, mediaId: req.params.id });
    res.status(500).json({ error: 'Failed to update media' });
  }
};

// Delete media (teachers only)
export const deleteMedia = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'reception') {
      return res.status(403).json({ error: 'Only teachers, admins, and reception can delete media' });
    }

    const { id } = req.params;
    const media = await Media.findByPk(id);

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Delete file from storage
    try {
      await deleteFile(media.url);
      
      // Also delete thumbnail if it exists
      if (media.thumbnail && media.thumbnail !== media.url) {
        await deleteFile(media.thumbnail);
      }
    } catch (error) {
      logger.warn('Error deleting file from storage', { error: error.message, mediaId: id });
      // Continue with database deletion even if file deletion fails
    }

    await media.destroy();
    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    logger.error('Delete media error', { error: error.message, stack: error.stack, mediaId: req.params.id });
    res.status(500).json({ error: 'Failed to delete media' });
  }
};
