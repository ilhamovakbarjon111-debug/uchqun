import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChild } from '../context/ChildContext';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Filter,
} from 'lucide-react';

const Payments = () => {
  const { user } = useAuth();
  const { selectedChild } = useChild();
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [totalAmount, setTotalAmount] = useState(0);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentType: 'tuition',
    paymentMethod: 'card',
    description: '',
  });

  useEffect(() => {
    loadPayments();
  }, [filter, selectedChild?.id]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      if (selectedChild?.id) {
        params.childId = selectedChild.id;
      }
      const response = await api.get('/payments', { params });
      // Ensure payments is always an array
      const paymentsData = response.data?.data?.payments;
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setTotalAmount(response.data?.data?.totalAmount || 0);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', {
        ...formData,
        childId: selectedChild?.id || null,
        amount: parseFloat(formData.amount),
      });
      setShowPaymentForm(false);
      setFormData({
        amount: '',
        paymentType: 'tuition',
        paymentMethod: 'card',
        description: '',
      });
      loadPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
      alert(error.response?.data?.error || 'Failed to create payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'failed':
        return XCircle;
      case 'pending':
      case 'processing':
        return Clock;
      default:
        return Clock;
    }
  };

  const getPaymentTypeLabel = (type) => {
    const labels = {
      tuition: t('payments.tuition', { defaultValue: 'Ta\'lim' }),
      therapy: t('payments.therapy', { defaultValue: 'Terapiya' }),
      meal: t('payments.meal', { defaultValue: 'Ovqat' }),
      activity: t('payments.activity', { defaultValue: 'Faoliyat' }),
      other: t('payments.other', { defaultValue: 'Boshqa' }),
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('payments.title', { defaultValue: 'To\'lovlar' })}
          </h1>
          <p className="text-gray-600">
            {t('payments.subtitle', { defaultValue: 'To\'lovlar tarixi va boshqaruv' })}
          </p>
        </div>
        <button
          onClick={() => setShowPaymentForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          {t('payments.newPayment', { defaultValue: 'Yangi to\'lov' })}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-400 to-green-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
          </div>
          <p className="text-3xl font-bold mb-1">{totalAmount.toLocaleString()} UZS</p>
          <p className="text-green-100">{t('payments.totalAmount', { defaultValue: 'Jami to\'lov' })}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {Array.isArray(payments) ? payments.filter(p => p.status === 'completed').length : 0}
          </p>
          <p className="text-gray-600">{t('payments.completed', { defaultValue: 'Yakunlangan' })}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {Array.isArray(payments) ? payments.filter(p => p.status === 'pending' || p.status === 'processing').length : 0}
          </p>
          <p className="text-gray-600">{t('payments.pending', { defaultValue: 'Kutilmoqda' })}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('payments.all', { defaultValue: 'Barchasi' })}
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('payments.completed', { defaultValue: 'Yakunlangan' })}
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('payments.pending', { defaultValue: 'Kutilmoqda' })}
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'failed'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('payments.failed', { defaultValue: 'Muvaffaqiyatsiz' })}
        </button>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('payments.newPayment', { defaultValue: 'Yangi to\'lov' })}
            </h2>
            <form onSubmit={createPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payments.amount', { defaultValue: 'Summa' })}
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payments.paymentType', { defaultValue: 'To\'lov turi' })}
                </label>
                <select
                  required
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="tuition">{t('payments.tuition', { defaultValue: 'Ta\'lim' })}</option>
                  <option value="therapy">{t('payments.therapy', { defaultValue: 'Terapiya' })}</option>
                  <option value="meal">{t('payments.meal', { defaultValue: 'Ovqat' })}</option>
                  <option value="activity">{t('payments.activity', { defaultValue: 'Faoliyat' })}</option>
                  <option value="other">{t('payments.other', { defaultValue: 'Boshqa' })}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payments.paymentMethod', { defaultValue: 'To\'lov usuli' })}
                </label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="card">{t('payments.card', { defaultValue: 'Karta' })}</option>
                  <option value="bank_transfer">{t('payments.bankTransfer', { defaultValue: 'Bank o\'tkazmasi' })}</option>
                  <option value="mobile_payment">{t('payments.mobilePayment', { defaultValue: 'Mobil to\'lov' })}</option>
                  <option value="cash">{t('payments.cash', { defaultValue: 'Naqd' })}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payments.description', { defaultValue: 'Tavsif' })}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  {t('payments.create', { defaultValue: 'Yaratish' })}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  {t('payments.cancel', { defaultValue: 'Bekor qilish' })}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Payments List */}
      <div className="space-y-4">
        {Array.isArray(payments) && payments.map((payment) => {
          const StatusIcon = getStatusIcon(payment.status);
          const statusColor = getStatusColor(payment.status);
          return (
            <Card key={payment.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${statusColor}`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {getPaymentTypeLabel(payment.paymentType)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{payment.description || '-'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                      {payment.child && (
                        <span>{payment.child.firstName} {payment.child.lastName}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {parseFloat(payment.amount).toLocaleString()} {payment.currency}
                  </p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {(!Array.isArray(payments) || payments.length === 0) && (
        <Card className="p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('payments.noPayments', { defaultValue: 'To\'lovlar yo\'q' })}
          </h3>
          <p className="text-gray-600">
            {t('payments.noPaymentsDesc', { defaultValue: 'Hozircha to\'lovlar mavjud emas' })}
          </p>
        </Card>
      )}
    </div>
  );
};

export default Payments;
