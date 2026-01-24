import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import {
  DollarSign,
  Plus,
  CreditCard,
  Calendar,
  User,
  Building2,
  Baby,
  Save,
  X,
  Search,
} from 'lucide-react';

/**
 * Payment Management Page for Admin
 * 
 * Business Logic:
 * - Admin can create payments for parents
 * - Admin can view all payments from parents created by their receptions
 */
const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingParents, setLoadingParents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    parentId: '',
    childId: '',
    schoolId: '',
    amount: '',
    currency: 'UZS',
    paymentType: 'tuition',
    paymentMethod: 'card',
    paymentProvider: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, parentsRes] = await Promise.all([
        api.get('/payments?limit=50'),
        api.get('/admin/parents'),
      ]);

      setPayments(paymentsRes.data.data?.payments || []);
      setParents(parentsRes.data.data || []);
    } catch (error) {
      showError(t('payment.loadError', { defaultValue: 'To\'lovlarni yuklashda xatolik' }));
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildren = async (parentId) => {
    if (!parentId) {
      setChildren([]);
      return;
    }

    try {
      setLoadingParents(true);
      const response = await api.get(`/admin/parents/${parentId}`);
      const parentData = response.data.data;
      setChildren(parentData.children || []);
    } catch (error) {
      console.error('Error loading children:', error);
      setChildren([]);
    } finally {
      setLoadingParents(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      parentId: '',
      childId: '',
      schoolId: '',
      amount: '',
      currency: 'UZS',
      paymentType: 'tuition',
      paymentMethod: 'card',
      paymentProvider: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.parentId || !formData.amount || !formData.paymentType || !formData.paymentMethod) {
      showError(t('payment.validation.required', { defaultValue: 'Barcha majburiy maydonlar to\'ldirilishi kerak' }));
      return;
    }

    try {
      setSaving(true);
      await api.post('/payments', {
        ...formData,
        parentId: formData.parentId,
        amount: parseFloat(formData.amount),
      });
      success(t('payment.createSuccess', { defaultValue: 'To\'lov yaratildi' }));
      setShowModal(false);
      loadData();
    } catch (error) {
      showError(error.response?.data?.error || t('payment.saveError', { defaultValue: 'Saqlashda xatolik' }));
    } finally {
      setSaving(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const query = searchQuery.toLowerCase();
    return (
      payment.parent?.firstName?.toLowerCase().includes(query) ||
      payment.parent?.lastName?.toLowerCase().includes(query) ||
      payment.parent?.email?.toLowerCase().includes(query) ||
      payment.description?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {t('payment.management', { defaultValue: 'To\'lov Boshqaruvi' })}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('payment.managementDesc', { defaultValue: 'Ota-onalar uchun to\'lovlar yarating va boshqaring' })}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {t('payment.create', { defaultValue: 'Yangi To\'lov' })}
        </button>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('payment.search', { defaultValue: 'Qidirish...' })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <Card className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('payment.noPayments', { defaultValue: 'To\'lovlar topilmadi' })}
            </h3>
            <p className="text-gray-600">
              {t('payment.noPaymentsDesc', { defaultValue: 'Hozircha to\'lovlar yo\'q' })}
            </p>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-600' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {payment.parent?.firstName} {payment.parent?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{payment.parent?.email}</p>
                    </div>
                  </div>
                  {payment.child && (
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Baby className="w-4 h-4" />
                      {payment.child.firstName} {payment.child.lastName}
                    </p>
                  )}
                  {payment.school && (
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {payment.school.name}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      {payment.paymentType} - {payment.paymentMethod}
                    </span>
                    {payment.paidAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(payment.paidAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {payment.description && (
                    <p className="text-sm text-gray-600 mt-2">{payment.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 mb-1">
                    {parseFloat(payment.amount || 0).toLocaleString()} {payment.currency}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">
                {t('payment.create', { defaultValue: 'Yangi To\'lov' })}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('payment.parent', { defaultValue: 'Ota-ona' })} *
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => {
                    setFormData({ ...formData, parentId: e.target.value, childId: '' });
                    loadChildren(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">{t('payment.selectParent', { defaultValue: 'Ota-onani tanlang' })}</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.firstName} {parent.lastName} ({parent.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('payment.child', { defaultValue: 'Bola' })}
                </label>
                <select
                  value={formData.childId}
                  onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={!formData.parentId || loadingParents}
                >
                  <option value="">{t('payment.selectChild', { defaultValue: 'Bolani tanlang (ixtiyoriy)' })}</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.firstName} {child.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('payment.amount', { defaultValue: 'Summa' })} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('payment.currency', { defaultValue: 'Valyuta' })}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="UZS">UZS</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('payment.type', { defaultValue: 'To\'lov Turi' })} *
                  </label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="tuition">{t('payment.tuition', { defaultValue: 'Ta\'lim' })}</option>
                    <option value="therapy">{t('payment.therapy', { defaultValue: 'Terapiya' })}</option>
                    <option value="meal">{t('payment.meal', { defaultValue: 'Ovqat' })}</option>
                    <option value="activity">{t('payment.activity', { defaultValue: 'Faoliyat' })}</option>
                    <option value="other">{t('payment.other', { defaultValue: 'Boshqa' })}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('payment.method', { defaultValue: 'To\'lov Usuli' })} *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="card">{t('payment.card', { defaultValue: 'Karta' })}</option>
                    <option value="bank_transfer">{t('payment.bankTransfer', { defaultValue: 'Bank o\'tkazmasi' })}</option>
                    <option value="cash">{t('payment.cash', { defaultValue: 'Naqd' })}</option>
                    <option value="mobile_payment">{t('payment.mobilePayment', { defaultValue: 'Mobil to\'lov' })}</option>
                    <option value="online">{t('payment.online', { defaultValue: 'Onlayn' })}</option>
                    <option value="other">{t('payment.other', { defaultValue: 'Boshqa' })}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('payment.provider', { defaultValue: 'To\'lov Provayderi' })}
                </label>
                <input
                  type="text"
                  value={formData.paymentProvider}
                  onChange={(e) => setFormData({ ...formData, paymentProvider: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Payme, Click, Uzcard..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('payment.description', { defaultValue: 'Tavsif' })}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('payment.descriptionPlaceholder', { defaultValue: 'To\'lov tavsifi...' })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                  disabled={saving}
                >
                  {t('payment.cancel', { defaultValue: 'Bekor qilish' })}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('payment.saving', { defaultValue: 'Saqlanmoqda...' })}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{t('payment.save', { defaultValue: 'Saqlash' })}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
