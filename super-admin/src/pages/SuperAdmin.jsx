import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  Crown, 
  Mail,
  Lock,
  Plus,
  User,
  LogOut,
  Building2,
  Star,
  MessageSquare,
  Send,
  Check,
  X,
  Phone,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import Card from '../components/Card';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const SuperAdmin = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    create: false,
    edit: false,
  });
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [activeTab, setActiveTab] = useState('admins'); // 'admins', 'schools', 'messages', 'registrations'
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvingRequest, setApprovingRequest] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { success, error: showError } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Load existing admins
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        setLoadingAdmins(true);
        const res = await api.get('/super-admin/admins');
        setAdmins(res.data?.data || []);
      } catch (error) {
        console.error('Failed to load admins', error);
        showError(t('superAdmin.toastLoadError'));
        setAdmins([]);
      } finally {
        setLoadingAdmins(false);
      }
    };

    loadAdmins();
  }, [showError]);

  // Load schools
  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoadingSchools(true);
        const res = await api.get('/super-admin/schools');
        setSchools(res.data?.data || []);
      } catch (error) {
        console.error('Failed to load schools', error);
        setSchools([]);
      } finally {
        setLoadingSchools(false);
      }
    };

    loadSchools();
  }, []);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get('/super-admin/messages');
        setMessages(res.data?.data || []);
      } catch (error) {
        console.error('Failed to load messages', error);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, []);

  // Load admin registration requests
  useEffect(() => {
    const loadRegistrationRequests = async () => {
      try {
        setLoadingRegistrations(true);
        const res = await api.get('/super-admin/admin-registrations?status=pending');
        setRegistrationRequests(res.data?.data || []);
      } catch (error) {
        console.error('Failed to load registration requests', error);
        setRegistrationRequests([]);
      } finally {
        setLoadingRegistrations(false);
      }
    };

    if (activeTab === 'registrations') {
      loadRegistrationRequests();
    }
  }, [activeTab]);


  const handleReply = async (messageId) => {
    if (!replyText.trim()) return;

    setReplying(true);
    try {
      await api.post(`/super-admin/messages/${messageId}/reply`, { reply: replyText.trim() });
      success(t('superAdmin.replySent', { defaultValue: 'Javob yuborildi' }));
      setReplyText('');
      setSelectedMessage(null);
      // Reload messages
      const res = await api.get('/super-admin/messages');
      setMessages(res.data?.data || []);
    } catch (error) {
      showError(error.response?.data?.error || t('superAdmin.replyError', { defaultValue: 'Javob yuborishda xatolik' }));
    } finally {
      setReplying(false);
    }
  };

  const handleMarkRead = async (messageId, isRead) => {
    try {
      await api.put(`/super-admin/messages/${messageId}/read`, { isRead });
      // Reload messages
      const res = await api.get('/super-admin/messages');
      setMessages(res.data?.data || []);
    } catch (error) {
      console.error('Failed to mark message as read', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password) {
      showError(t('superAdmin.validation.required'));
      return;
    }

    try {
      setLoading(true);
      await api.post('/super-admin/admins', {
        firstName,
        lastName,
        email,
        password,
      });
      
      success(t('superAdmin.toastCreate'));
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');

      // Reload or append new admin
      try {
        const res = await api.get('/super-admin/admins');
        setAdmins(res.data?.data || []);
      } catch (err) {
        // fallback: do nothing if reload fails
      }
    } catch (error) {
      showError(error.response?.data?.error || t('superAdmin.toastSaveError'));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (adm) => {
    setEditingAdmin(adm);
    setEditFirstName(adm.firstName || '');
    setEditLastName(adm.lastName || '');
    setEditEmail(adm.email || '');
    setEditPhone(adm.phone || '');
    setEditPassword('');
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;
    try {
      setEditSaving(true);
      await api.put(`/super-admin/admins/${editingAdmin.id}`, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        password: editPassword || undefined,
      });
      success(t('superAdmin.toastUpdate'));
      const res = await api.get('/super-admin/admins');
      setAdmins(res.data?.data || []);
      setEditingAdmin(null);
      setEditPassword('');
    } catch (error) {
      showError(error.response?.data?.error || t('superAdmin.toastSaveError'));
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm(t('superAdmin.confirmDelete'))) return;
    try {
      await api.delete(`/super-admin/admins/${id}`);
      success(t('superAdmin.toastDelete'));
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      showError(error.response?.data?.error || t('superAdmin.toastDeleteError'));
    }
  };

  const handleApproveRequest = async (id) => {
    if (!confirm('Bu so\'rovni tasdiqlaysizmi? Login ma\'lumotlari emailga yuboriladi.')) return;
    
    setApprovingRequest(true);
    try {
      const res = await api.post(`/super-admin/admin-registrations/${id}/approve`, {});
      success('So\'rov tasdiqlandi va login ma\'lumotlari emailga yuborildi');
      // Reload requests
      const requestsRes = await api.get('/super-admin/admin-registrations?status=pending');
      setRegistrationRequests(requestsRes.data?.data || []);
      // Reload admins
      const adminsRes = await api.get('/super-admin/admins');
      setAdmins(adminsRes.data?.data || []);
    } catch (error) {
      showError(error.response?.data?.error || 'So\'rovni tasdiqlashda xatolik');
    } finally {
      setApprovingRequest(false);
    }
  };

  const handleRejectRequest = async (id) => {
    setRejectingRequest(true);
    try {
      await api.post(`/super-admin/admin-registrations/${id}/reject`, {
        reason: rejectionReason.trim() || null,
      });
      success('So\'rov rad etildi');
      setSelectedRequest(null);
      setRejectionReason('');
      // Reload requests
      const res = await api.get('/super-admin/admin-registrations?status=pending');
      setRegistrationRequests(res.data?.data || []);
    } catch (error) {
      showError(error.response?.data?.error || 'So\'rovni rad etishda xatolik');
    } finally {
      setRejectingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('header.title')}</h1>
                <p className="text-sm text-gray-500">{t('header.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('header.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'admins'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('superAdmin.tabs.admins', { defaultValue: 'Adminlar' })}
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'schools'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('superAdmin.tabs.schools', { defaultValue: 'Maktablar' })}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 relative ${
              activeTab === 'messages'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('superAdmin.tabs.messages', { defaultValue: 'Xabarlar' })}
            {messages.filter(m => !m.isRead).length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {messages.filter(m => !m.isRead).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className={`${activeTab === 'messages' ? 'max-w-6xl' : 'max-w-2xl'} w-full space-y-8`}>
          {activeTab === 'admins' && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                  {t('superAdmin.createTitle')}
                </h2>
                <p className="text-gray-600 font-medium">{t('superAdmin.createSubtitle')}</p>
              </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {t('superAdmin.form.firstName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('superAdmin.form.firstName')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {t('superAdmin.form.lastName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('superAdmin.form.lastName')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {t('superAdmin.form.email')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  {t('superAdmin.form.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.create ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('superAdmin.form.password')}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, create: !showPasswords.create })}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.create ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('superAdmin.status.loadingAdmins')}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>{t('superAdmin.form.create')}</span>
                  </>
                )}
              </button>
            </form>
          </Card>

          {/* Admin list */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{t('superAdmin.listTitle')}</h3>
              {loadingAdmins && <div className="text-sm text-gray-500">{t('superAdmin.status.loadingAdmins')}</div>}
            </div>
            {loadingAdmins ? (
              <div className="flex items-center justify-center min-h-[120px]">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : admins.length === 0 ? (
              <p className="text-sm text-gray-600">{t('superAdmin.toastLoadError')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {admins.map((adm) => (
                  <div key={adm.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                        {adm.firstName?.charAt(0)}
                        {adm.lastName?.charAt(0)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {adm.firstName} {adm.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{adm.email}</p>
                        <p className="text-xs text-gray-500">
                          {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : '—'}
                        </p>
                        {adm.phone && (
                          <p className="text-xs text-gray-500">{adm.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => startEdit(adm)}
                        className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        {t('superAdmin.form.update')}
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(adm.id)}
                        className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        {t('superAdmin.toastDelete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

            </>
          )}

          {activeTab === 'schools' && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                  {t('superAdmin.schoolsTitle')}
                </h2>
                <p className="text-gray-600 font-medium">{t('superAdmin.schoolsSubtitle', { defaultValue: 'Barcha maktablar va ularning baholari' })}</p>
              </div>

              <Card className="p-6 space-y-4">
                {loadingSchools ? (
                  <div className="flex items-center justify-center min-h-[120px]">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : schools.length === 0 ? (
                  <p className="text-sm text-gray-600">{t('superAdmin.schoolsEmpty')}</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {schools.map((school) => (
                      <div key={school.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-semibold text-gray-900">{school.name}</p>
                            {school.address && (
                              <p className="text-xs text-gray-600">{school.address}</p>
                            )}
                            {school.type && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-700">
                                {school.type === 'school' ? t('superAdmin.schoolTypeSchool') :
                                 school.type === 'kindergarten' ? t('superAdmin.schoolTypeKindergarten') :
                                 t('superAdmin.schoolTypeBoth')}
                              </span>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Star className="w-4 h-4 fill-green-500 text-green-500" />
                              <span className="text-sm font-bold text-gray-900">
                                {school.summary?.average?.toFixed(1) || '0.0'}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({school.summary?.count || 0} {t('superAdmin.ratings')})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {activeTab === 'messages' && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                  {t('superAdmin.messagesTitle', { defaultValue: 'Xabarlar' })}
                </h2>
                <p className="text-gray-600 font-medium">{t('superAdmin.messagesSubtitle', { defaultValue: 'Foydalanuvchilardan kelgan xabarlar' })}</p>
              </div>

              <Card className="p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center min-h-[120px]">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-gray-600">{t('superAdmin.messagesEmpty', { defaultValue: 'Xabarlar yo\'q' })}</p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`border rounded-xl p-4 hover:shadow-sm transition-shadow ${
                          !msg.isRead ? 'border-primary-300 bg-primary-50' : 'border-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{msg.subject}</h3>
                              {!msg.isRead && (
                                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-primary-500 text-white">
                                  {t('superAdmin.new', { defaultValue: 'Yangi' })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{msg.message}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>
                                {msg.sender?.firstName} {msg.sender?.lastName} ({msg.sender?.role})
                              </span>
                              <span>{new Date(msg.createdAt).toLocaleString()}</span>
                            </div>
                            {msg.reply && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-xs font-semibold text-green-700 mb-1">
                                  {t('superAdmin.reply', { defaultValue: 'Javob' })}:
                                </p>
                                <p className="text-sm text-gray-700">{msg.reply}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(msg.repliedAt).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {!msg.isRead && (
                              <button
                                onClick={() => handleMarkRead(msg.id, true)}
                                className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                              >
                                <Check className="w-3 h-3 inline mr-1" />
                                {t('superAdmin.markRead', { defaultValue: 'O\'qildi' })}
                              </button>
                            )}
                            {!msg.reply && (
                              <button
                                onClick={() => setSelectedMessage(msg)}
                                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <Send className="w-3 h-3 inline mr-1" />
                                {t('superAdmin.reply', { defaultValue: 'Javob berish' })}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Reply Modal */}
              {selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">
                        {t('superAdmin.replyTo', { defaultValue: 'Javob berish' })}: {selectedMessage.subject}
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedMessage(null);
                          setReplyText('');
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('superAdmin.replyText', { defaultValue: 'Javob' })}
                        </label>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={6}
                          placeholder={t('superAdmin.replyPlaceholder', { defaultValue: 'Javobingizni yozing...' })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedMessage(null);
                            setReplyText('');
                          }}
                          className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                          disabled={replying}
                        >
                          {t('superAdmin.cancel', { defaultValue: 'Bekor qilish' })}
                        </button>
                        <button
                          onClick={() => handleReply(selectedMessage.id)}
                          disabled={replying || !replyText.trim()}
                          className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {replying ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>{t('superAdmin.sending', { defaultValue: 'Yuborilmoqda...' })}</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>{t('superAdmin.send', { defaultValue: 'Yuborish' })}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'registrations' && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                  Admin Ro'yxatdan O'tish So'rovlari
                </h2>
                <p className="text-gray-600 font-medium">Yangi admin so'rovlarini ko'rib chiqing va tasdiqlang</p>
              </div>

              <Card className="p-6 space-y-4">
                {loadingRegistrations ? (
                  <div className="flex items-center justify-center min-h-[120px]">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : registrationRequests.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-8">Hozircha so'rovlar yo'q</p>
                ) : (
                  <div className="space-y-4">
                    {registrationRequests.map((request) => (
                      <div
                        key={request.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">
                                {request.firstName} {request.lastName}
                              </h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {request.email}
                                </span>
                                {request.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {request.phone}
                                  </span>
                                )}
                              </div>
                            </div>

                            {(request.passportNumber || request.location) && (
                              <div className="text-sm text-gray-600 space-y-1">
                                {request.passportNumber && (
                                  <p>Passport: {request.passportNumber} {request.passportSeries && `(${request.passportSeries})`}</p>
                                )}
                                {request.location && <p>Manzil: {request.location}</p>}
                                {request.region && <p>Viloyat: {request.region}</p>}
                                {request.city && <p>Shahar: {request.city}</p>}
                              </div>
                            )}

                            <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                              {request.certificateFile && (
                                <a
                                  href={request.certificateFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                >
                                  <FileText className="w-4 h-4" />
                                  Guvohnoma
                                </a>
                              )}
                              {request.passportFile && (
                                <a
                                  href={request.passportFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                >
                                  <FileText className="w-4 h-4" />
                                  Passport/ID
                                </a>
                              )}
                            </div>

                            <p className="text-xs text-gray-500">
                              So'rov yuborilgan: {new Date(request.createdAt).toLocaleString('uz-UZ')}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={approvingRequest}
                              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Tasdiqlash
                            </button>
                            <button
                              onClick={() => setSelectedRequest(request)}
                              disabled={rejectingRequest}
                              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Rad etish
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Reject Modal */}
              {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">
                        So'rovni rad etish
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedRequest(null);
                          setRejectionReason('');
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-gray-600">
                        {selectedRequest.firstName} {selectedRequest.lastName} so'rovini rad etishni tasdiqlaysizmi?
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rad etish sababi (ixtiyoriy)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={4}
                          placeholder="Rad etish sababini kiriting..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedRequest(null);
                            setRejectionReason('');
                          }}
                          className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                          disabled={rejectingRequest}
                        >
                          Bekor qilish
                        </button>
                        <button
                          onClick={() => handleRejectRequest(selectedRequest.id)}
                          disabled={rejectingRequest}
                          className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {rejectingRequest ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Rad etilmoqda...</span>
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              <span>Rad etish</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Edit modal */}
          {editingAdmin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t('superAdmin.editTitle')}</h3>
                    <p className="text-sm text-gray-500">{editingAdmin.email}</p>
                  </div>
                  <button
                    onClick={() => setEditingAdmin(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleUpdateAdmin} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('superAdmin.form.firstName')}</label>
                      <input
                        type="text"
                        required
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('superAdmin.form.lastName')}</label>
                      <input
                        type="text"
                        required
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('superAdmin.form.email')}</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('superAdmin.form.phone')}</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('superAdmin.form.password')}</label>
                    <div className="relative">
                      <input
                        type={showPasswords.edit ? 'text' : 'password'}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Parolni o'zgartirish uchun kiriting"
                        className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, edit: !showPasswords.edit })}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.edit ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingAdmin(null)}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      disabled={editSaving}
                    >
                      {t('superAdmin.form.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={editSaving}
                      className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {editSaving ? t('superAdmin.status.loadingAdmins') : t('superAdmin.form.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
