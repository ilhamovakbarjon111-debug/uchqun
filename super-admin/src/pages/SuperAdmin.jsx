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
  Star
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
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-orange-600" />
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

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full space-y-8">
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  {t('superAdmin.form.password')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('superAdmin.form.password')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : admins.length === 0 ? (
              <p className="text-sm text-gray-600">{t('superAdmin.toastLoadError')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {admins.map((adm) => (
                  <div key={adm.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center">
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
                        className="px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
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

          {/* Schools with ratings */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{t('superAdmin.schoolsTitle')}</h3>
              {loadingSchools && <div className="text-sm text-gray-500">{t('superAdmin.status.loadingSchools')}</div>}
            </div>
            {loadingSchools ? (
              <div className="flex items-center justify-center min-h-[120px]">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
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
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('superAdmin.form.lastName')}</label>
                      <input
                        type="text"
                        required
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('superAdmin.form.phone')}</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('superAdmin.form.password')}</label>
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Parolni o‘zgartirish uchun kiriting"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
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
                      className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
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
