import { Op } from 'sequelize';
import Child from '../models/Child.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import { uploadFile } from '../config/storage.js';

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
    console.error('Get children error:', error);
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
    console.error('Get child error:', error);
    res.status(500).json({ error: 'Failed to get child' });
  }
};

export const updateChild = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Debug logging
    console.log('=== UPDATE CHILD ===');
    console.log('Has req.file?', !!req.file);
    console.log('Has req.body.photoBase64?', !!req.body.photoBase64);
    console.log('Body keys:', Object.keys(req.body));

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
    const debugInfo = { hasFile: false, hasBase64: false, uploadMethod: 'none' };

    // Handle photo upload - supports both multipart (req.file) and base64 (req.body.photoBase64)
    if (req.file) {
      debugInfo.hasFile = true;
      debugInfo.uploadMethod = 'multipart';
      // Multipart upload (legacy)
      try {
        console.log('📸 Multipart file received:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        
        const fileBuffer = req.file.buffer;
        const filename = `child-${id}-${Date.now()}${req.file.originalname.substring(req.file.originalname.lastIndexOf('.'))}`;
        
        const uploadResult = await uploadFile(fileBuffer, filename, req.file.mimetype);
        updateData.photo = uploadResult.url;
        delete updateData.photoBase64;
        
        console.log('✅ Photo uploaded (multipart):', uploadResult.url);
        debugInfo.success = true;
      } catch (uploadError) {
        console.error('❌ Multipart upload error:', uploadError);
        debugInfo.error = uploadError.message;
        return res.status(500).json({ 
          error: 'Failed to upload photo', 
          message: uploadError.message,
          debug: debugInfo
        });
      }
    } else if (req.body.photoBase64) {
      debugInfo.hasBase64 = true;
      debugInfo.uploadMethod = 'base64';
      // Base64 upload (new method)
      try {
        console.log('📸 Base64 photo received, length:', req.body.photoBase64.length);
        
        const matches = req.body.photoBase64.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
          throw new Error('Invalid base64 format');
        }
        
        const mimetype = matches[1];
        const base64Data = matches[2];
        const fileBuffer = Buffer.from(base64Data, 'base64');
        const extension = mimetype.split('/')[1] || 'jpg';
        const filename = `child-${id}-${Date.now()}.${extension}`;
        
        console.log('📤 Uploading to Appwrite:', { filename, mimetype, size: fileBuffer.length });
        
        const uploadResult = await uploadFile(fileBuffer, filename, mimetype);
        updateData.photo = uploadResult.url;
        delete updateData.photoBase64;
        
        console.log('✅ Photo uploaded (base64):', uploadResult.url);
        debugInfo.success = true;
        debugInfo.photoUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('❌ Base64 upload error:', uploadError.message);
        console.error('Stack:', uploadError.stack);
        debugInfo.error = uploadError.message;
        debugInfo.stack = uploadError.stack;
        return res.status(500).json({ 
          error: 'Failed to upload photo', 
          message: uploadError.message,
          debug: debugInfo
        });
      }
    } else {
      console.log('⚠️ No photo data in request');
      debugInfo.warning = 'No photo data provided';
    }

    await child.update(updateData);
    await child.reload();

    const childData = child.toJSON();
    childData.age = child.getAge();
    
    // ALWAYS add debug info (for troubleshooting)
    childData._debug = debugInfo;
    childData._codeVersion = '2026-01-11-v2'; // To verify deployment

    console.log('=== UPDATE COMPLETE ===');
    console.log('Photo:', childData.photo);
    console.log('Debug:', debugInfo);

    res.json(childData);
  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({ error: 'Failed to update child', message: error.message });
  }
};