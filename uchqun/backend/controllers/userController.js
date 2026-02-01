import User from '../models/User.js';

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, notificationPreferences } = req.body;
    
    // Use the user from the middleware (already authenticated)
    const user = req.user;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build update data object
    const updateData = {};
    if (firstName !== undefined && firstName !== null) updateData.firstName = firstName;
    if (lastName !== undefined && lastName !== null) updateData.lastName = lastName;
    if (phone !== undefined && phone !== null) updateData.phone = phone;
    if (notificationPreferences !== undefined && notificationPreferences !== null) {
      updateData.notificationPreferences = notificationPreferences;
    }

    // Validate required fields
    if (updateData.firstName === '' || updateData.lastName === '') {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Update the user
    await user.update(updateData);
    
    // Reload to get fresh data
    await user.reload();
    
    res.json(user.toJSON());
  } catch (error) {
    console.error('Update profile error:', error);
    const errorMessage = error.message || 'Failed to update profile';
    res.status(500).json({ error: errorMessage });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

