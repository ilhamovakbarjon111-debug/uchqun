import { Op } from 'sequelize';
import Child from '../models/Child.js';
import User from '../models/User.js';
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
        delete updateData.photoBase64; // Remove base64 from update data
        
        console.log('✅ Photo uploaded (multipart):', uploadResult.url);
      } catch (uploadError) {
        console.error('❌ Multipart upload error:', uploadError);
        return res.status(500).json({ 
          error: 'Failed to upload photo', 
          message: uploadError.message 
        });
      }
    } else if (req.body.photoBase64) {
      // Base64 upload (new method)
      try {
        console.log('📸 Base64 photo received');
        
        // Extract data from base64 string (format: data:image/jpeg;base64,/9j/4AAQ...)
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
        delete updateData.photoBase64; // Remove base64 from update data
        
        console.log('✅ Photo uploaded (base64):', uploadResult.url);
      } catch (uploadError) {
        console.error('❌ Base64 upload error:', uploadError);
        return res.status(500).json({ 
          error: 'Failed to upload photo', 
          message: uploadError.message 
        });
      }
    }

    await child.update(updateData);
    await child.reload();

    const childData = child.toJSON();
    childData.age = child.getAge();

    res.json(childData);
  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({ error: 'Failed to update child', message: error.message });
  }
};