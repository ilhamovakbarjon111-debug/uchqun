import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  User,
  Lock,
  Bell,
  Save,
  Mail,
  Phone,
  MessageSquare,
  Send,
  X
} from 'lucide-react';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notificationPreferences: {
      email: true,
      push: true,
    },
  });
  const { success, error: showError } = useToast();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      const userData = response.data;
      setProfileForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        notificationPreferences: userData.notificationPreferences || {
          email: true,
          push: true,
        },
      });
      if (setUser) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showError(error.response?.data?.error || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put('/user/profile', profileForm);
      success('Profile updated successfully');
      if (setUser) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError(error.response?.data?.error || 'Error updating profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    try {
      await api.put('/user/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      showError(error.response?.data?.error || 'Error changing password');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your profile and account settings</p>
      </div>

      {/* Profile Settings */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={profileForm.email}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm"
            >
              <Save className="w-5 h-5" />
              Save Profile
            </button>
          </div>
        </Card>
      </form>

      {/* Notification Preferences */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profileForm.notificationPreferences.email}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  notificationPreferences: {
                    ...profileForm.notificationPreferences,
                    email: e.target.checked,
                  },
                })}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                <p className="text-xs text-gray-500">Receive updates via email</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profileForm.notificationPreferences.push}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  notificationPreferences: {
                    ...profileForm.notificationPreferences,
                    push: e.target.checked,
                  },
                })}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                <p className="text-xs text-gray-500">Receive push notifications in browser</p>
              </div>
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm"
            >
              <Save className="w-5 h-5" />
              Save Preferences
            </button>
          </div>
        </Card>
      </form>

      {/* Password Change */}
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm"
            >
              <Save className="w-5 h-5" />
              Change Password
            </button>
          </div>
        </Card>
      </form>

      {/* Contact Super-Admin */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">Contact Super-Admin</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Super-adminga xabar yuborish uchun quyidagi tugmani bosing
        </p>
        <button
          onClick={() => setShowMessageModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <MessageSquare className="w-5 h-5" />
          Super-adminga xabar yuborish
        </button>
      </Card>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowMessageModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Super-adminga xabar yuborish</h2>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mavzu</label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Xabar mavzusi..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xabar</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={6}
                  placeholder="Xabaringizni yozing..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                disabled={sendingMessage}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageSubject.trim() || !messageText.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingMessage ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Yuborilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Yuborish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
