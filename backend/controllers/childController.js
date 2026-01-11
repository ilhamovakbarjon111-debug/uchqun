import { Op } from 'sequelize';
import Child from '../models/Child.js';
import User from '../models/User.js';
import { uploadFile } from '../config/storage.js';
import fs from 'fs';

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

    // Handle photo upload via Appwrite storage
    if (req.file) {
      try {
        // Read file buffer from disk (multer saved it)
        const fileBuffer = fs.readFileSync(req.file.path);
        const uploadResult = await uploadFile(
          fileBuffer, 
          `child-${id}-${Date.now()}${req.file.originalname.substring(req.file.originalname.lastIndexOf('.'))}`,
          req.file.mimetype
        );
        updateData.photo = uploadResult.url;
        
        // Delete local temp file after upload
        fs.unlinkSync(req.file.path);
        
        console.log('✅ Photo uploaded to Appwrite:', uploadResult.url);
      } catch (uploadError) {
        console.error('Photo upload error:', uploadError);
        // Clean up temp file if upload failed
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
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