import Progress from '../models/Progress.js';
import Child from '../models/Child.js';

export const getProgress = async (req, res) => {
  try {
    // Get child for the authenticated parent
    const child = await Child.findOne({
      where: { parentId: req.user.id },
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    let progress = await Progress.findOne({
      where: { childId: child.id },
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    // If no progress exists, create default one
    if (!progress) {
      progress = await Progress.create({
        childId: child.id,
        academic: {},
        social: {},
        behavioral: {},
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const child = await Child.findOne({
      where: { parentId: req.user.id },
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    let progress = await Progress.findOne({
      where: { childId: child.id },
    });

    if (!progress) {
      progress = await Progress.create({
        childId: child.id,
        ...req.body,
      });
    } else {
      await progress.update(req.body);
    }

    const updatedProgress = await Progress.findByPk(progress.id, {
      include: [
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    res.json(updatedProgress);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};



