import { LogOut, MessageSquare, Send, X } from 'lucide-react';
import { useAuth } from '../shared/context/AuthContext';
import Card from '../shared/components/Card';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../shared/services/api';
import { useToast } from '../shared/context/ToastContext';
import { useState } from 'react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSendMessage = async () => {
    if (!messageSubject.trim() || !messageText.trim()) {
      showError('Subject va xabar to\'ldirilishi kerak');
      return;
    }

    setSendingMessage(true);
    try {
      await api.post('/teacher/message-to-super-admin', {
        subject: messageSubject.trim(),
        message: messageText.trim(),
      });
      success('Xabar muvaffaqiyatli yuborildi');
      setMessageSubject('');
      setMessageText('');
      setShowMessageModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      showError(error.response?.data?.error || 'Xabar yuborishda xatolik');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white drop-shadow-sm">Profile</h1>
          <p className="text-gray-500 text-sm">Manage your account</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('nav.logout')}
          </button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xl font-bold">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-xs uppercase text-gray-400 font-bold">Role</div>
            <div className="text-gray-900 font-semibold mt-1">{user?.role}</div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-xs uppercase text-gray-400 font-bold">ID</div>
            <div className="text-gray-900 font-semibold mt-1">{user?.id}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
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

export default Profile;

