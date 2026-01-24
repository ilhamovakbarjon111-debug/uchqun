import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Payments = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/government/payments');
      // Ensure payments is always an array
      const paymentsData = res.data?.data?.payments || res.data?.data || [];
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalRevenue = Array.isArray(payments)
    ? payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    : 0;
  
  // Format total revenue nicely
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('payments.title', { defaultValue: 'To\'lovlar' })}
        </h1>
        <p className="text-gray-600">
          {t('payments.subtitle', { defaultValue: 'Barcha to\'lovlar ro\'yxati' })}
        </p>
      </div>

      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">
              {t('payments.totalRevenue', { defaultValue: 'Jami daromad' })}
            </p>
            <p className="text-3xl font-bold">{formatCurrency(totalRevenue)} UZS</p>
          </div>
          <DollarSign className="w-12 h-12 opacity-80" />
        </div>
      </Card>

      {(!Array.isArray(payments) || payments.length === 0) ? (
        <Card className="p-12">
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {t('payments.notFound', { defaultValue: 'To\'lovlar topilmadi' })}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">
                      {payment.parentName || 
                       (payment.parent 
                         ? `${payment.parent.firstName || ''} ${payment.parent.lastName || ''}`.trim() || payment.parent.email || t('payments.unknown', { defaultValue: 'Noma\'lum ota-ona' })
                         : t('payments.unknown', { defaultValue: 'Noma\'lum ota-ona' }))}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {payment.status === 'completed' 
                        ? t('payments.status.completed', { defaultValue: 'To\'langan' })
                        : payment.status === 'pending'
                        ? t('payments.status.pending', { defaultValue: 'Kutilmoqda' })
                        : t('payments.status.rejected', { defaultValue: 'Rad etilgan' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {t('payments.school', { defaultValue: 'Maktab' })}: {payment.schoolName || (payment.school?.name) || t('payments.unknown', { defaultValue: 'Noma\'lum' })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('payments.date', { defaultValue: 'Sana' })}: {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('uz-UZ') : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(parseFloat(payment.amount || 0))} UZS
                  </p>
                  {payment.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-2 mx-auto" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 mt-2 mx-auto" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payments;
