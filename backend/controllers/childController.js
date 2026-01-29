import { Op } from 'sequelize';
import Child from '../models/Child.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import { uploadFile } from '../config/storage.js';
import logger from '../utils/logger.js';

// Get all children for the logged-in parent
export const getChildren = async (req, res) => {
  try {
    const children = await Child.findAll({
      where: { parentId: req.user.id },
      include: [
        {
          model: User,
          as: 'parent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          model: Group,
          as: 'childGroup',
          attributes: ['id', 'name'],
          required: false, // Child may not have a group
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    const childrenData = children.map(child => {
      const data = child.toJSON();
      data.age = child.getAge();
      return data;
    });

    res.json(childrenData);
  } catch (error) {
    logger.error('Get children error', { error: error.message, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to get children' });
  }
};

// Get a specific child by ID (for parents, only their own children)
export const getChild = async (req, res) => {
  try {
    const { id } = req.params;

    const child = await Child.findOne({
      where: {
        id,
        parentId: req.user.id
      },
      include: [
        {
          model: User,
          as: 'parent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          model: Group,
          as: 'childGroup',
          attributes: ['id', 'name'],
          required: false, // Child may not have a group
        },
      ],
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const childData = child.toJSON();
    childData.age = child.getAge();

    res.json(childData);
  } catch (error) {
    logger.error('Get child error', { error: error.message, childId: req.params?.id, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to get child' });
  }
};

export const updateChild = async (req, res) => {
  try {
    const { id } = req.params;

    const child = await Child.findOne({
      where: {
        id,
        parentId: req.user.id,
      },
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const updateData = { ...req.body };

    // Handle photo upload - supports both multipart (req.file) and base64 (req.body.photoBase64)
    if (req.file) {
      try {
        const fileBuffer = req.file.buffer;
        // Get extension from original filename or mimetype
        let extension = req.file.originalname.substring(req.file.originalname.lastIndexOf('.') + 1) || 
                       req.file.mimetype.split('/')[1] || 'jpg';
        // Normalize extension - Appwrite expects jpg, not jpeg
        if (extension === 'jpeg') {
          extension = 'jpg';
        }
        // Ensure extension is lowercase and valid
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!validExtensions.includes(extension.toLowerCase())) {
          extension = 'jpg'; // Default to jpg if invalid
        }
        const filename = `child-${id}-${Date.now()}.${extension.toLowerCase()}`;

        const uploadResult = await uploadFile(fileBuffer, filename, req.file.mimetype);
        updateData.photo = uploadResult.url;
        delete updateData.photoBase64;
      } catch (uploadError) {
        logger.error('Photo upload error (multipart)', { error: uploadError.message, childId: id });
        return res.status(500).json({ error: 'Failed to upload photo' });
      }
    } else if (req.body.photoBase64) {
      try {
        if (typeof req.body.photoBase64 !== 'string') {
          return res.status(400).json({ error: 'photoBase64 must be a string' });
        }

        const matches = req.body.photoBase64.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          logger.warn('Invalid base64 format', { 
            hasPrefix: req.body.photoBase64.startsWith('data:'),
            length: req.body.photoBase64.length,
            preview: req.body.photoBase64.substring(0, 50)
          });
          return res.status(400).json({ error: 'Invalid base64 photo format. Expected format: data:image/jpeg;base64,...' });
        }

        const mimetype = matches[1];
        const base64Data = matches[2];
        
        if (!base64Data || base64Data.length === 0) {
          return res.status(400).json({ error: 'Empty base64 data' });
        }

        let fileBuffer;
        try {
          fileBuffer = Buffer.from(base64Data, 'base64');
          if (fileBuffer.length === 0) {
            return res.status(400).json({ error: 'Failed to decode base64 data' });
          }
        } catch (decodeError) {
          logger.error('Base64 decode error', { error: decodeError.message });
          return res.status(400).json({ error: 'Invalid base64 encoding' });
        }

        // Normalize extension - Appwrite expects jpg, not jpeg
        let extension = mimetype.split('/')[1] || 'jpg';
        if (extension === 'jpeg') {
          extension = 'jpg';
        }
        // Ensure extension is lowercase and valid
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!validExtensions.includes(extension.toLowerCase())) {
          extension = 'jpg'; // Default to jpg if invalid
        }
        const filename = `child-${id}-${Date.now()}.${extension.toLowerCase()}`;

        logger.info('Uploading child photo', { 
          childId: id, 
          filename, 
          mimetype, 
          size: fileBuffer.length,
          bufferLength: fileBuffer.length
        });

        let uploadResult;
        try {
          uploadResult = await uploadFile(fileBuffer, filename, mimetype);
          logger.info('Upload file result:', { 
            hasUrl: !!uploadResult?.url,
            url: uploadResult?.url?.substring(0, 100),
            hasPath: !!uploadResult?.path
          });
        } catch (uploadFileError) {
          logger.error('uploadFile error in childController', {
            error: uploadFileError.message,
            stack: uploadFileError.stack,
            childId: id,
            filename,
            mimetype,
            bufferSize: fileBuffer.length,
            errorCode: uploadFileError.code,
            errorType: uploadFileError.type,
            errorResponse: uploadFileError.response ? {
              status: uploadFileError.response.status,
              statusText: uploadFileError.response.statusText,
              data: uploadFileError.response.data
            } : null
          });
          
          // Return more specific error message
          const errorMessage = uploadFileError.response?.data?.message || uploadFileError.message || 'Unknown upload error';
          const errorCode = uploadFileError.code || uploadFileError.response?.status || 'UNKNOWN';
          
          return res.status(500).json({ 
            error: 'Failed to upload photo',
            message: `Storage upload failed: ${errorMessage}`,
            code: errorCode,
            details: process.env.NODE_ENV === 'development' ? {
              originalError: uploadFileError.message,
              stack: uploadFileError.stack
            } : undefined
          });
        }

        if (!uploadResult || !uploadResult.url) {
          logger.error('Upload result missing URL', { uploadResult, childId: id });
          return res.status(500).json({ 
            error: 'Upload succeeded but no URL returned',
            details: process.env.NODE_ENV === 'development' ? 'Upload result is missing URL field' : undefined
          });
        }

        updateData.photo = uploadResult.url;
        delete updateData.photoBase64;
        
        logger.info('Child photo uploaded successfully', { 
          childId: id, 
          url: uploadResult.url.substring(0, 100)
        });
      } catch (uploadError) {
        logger.error('Photo upload error (base64)', { 
          error: uploadError.message, 
          stack: uploadError.stack,
          childId: id,
          hasPhotoBase64: !!req.body.photoBase64,
          photoBase64Length: req.body.photoBase64?.length,
          photoBase64Type: typeof req.body.photoBase64,
          errorCode: uploadError.code,
          errorName: uploadError.name,
          errorResponse: uploadError.response ? {
            status: uploadError.response.status,
            statusText: uploadError.response.statusText,
            data: uploadError.response.data
          } : null,
          originalError: uploadError.originalError ? {
            message: uploadError.originalError.message,
            code: uploadError.originalError.code
          } : null
        });
        
        // If error was already handled (response sent), don't send again
        if (res.headersSent) {
          return;
        }
        
        const errorMessage = uploadError.message || 'Unknown upload error';
        const errorCode = uploadError.code || 'UNKNOWN';
        
        return res.status(500).json({ 
          error: 'Failed to upload photo',
          message: errorMessage,
          code: errorCode,
          details: process.env.NODE_ENV === 'development' ? {
            stack: uploadError.stack,
            name: uploadError.name,
            originalError: uploadError.originalError ? uploadError.originalError.message : undefined
          } : undefined
        });
      }
    }

    try {
      await child.update(updateData);
      await child.reload();
    } catch (updateError) {
      logger.error('Child update error', {
        error: updateError.message,
        stack: updateError.stack,
        childId: id,
        updateData: { ...updateData, photo: updateData.photo?.substring(0, 100) }
      });
      return res.status(500).json({ 
        error: 'Failed to update child record',
        details: process.env.NODE_ENV === 'development' ? updateError.message : undefined
      });
    }

    const childData = child.toJSON();
    childData.age = child.getAge();

    res.json(childData);
  } catch (error) {
    logger.error('Update child error', { 
      error: error.message, 
      stack: error.stack,
      childId: req.params?.id, 
      userId: req.user?.id,
      hasPhotoBase64: !!req.body?.photoBase64,
      hasFile: !!req.file,
      errorName: error.name,
      errorCode: error.code
    });
    
    // If error was already handled (response sent), don't send again
    if (res.headersSent) {
      return;
    }
    
    res.status(500).json({ 
      error: 'Failed to update child',
      message: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name,
        code: error.code
      } : undefined
    });
  }
};