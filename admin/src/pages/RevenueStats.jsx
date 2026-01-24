import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
} from 'lucide-react';

const RevenueStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [paymentType, setPaymentType] = useState('');

  useEffect(() => {
    loadStats();
  }, [dateRange, paymentType]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const params = { ...dateRange };
      if (paymentType) params.paymentType = paymentType;
      
      const response = await api.get('/business/revenue', { params });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading revenue statistics:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Statistics</h1>
          <p className="text-gray-600 mt-1">Track your revenue and payment analytics</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Payment Types</option>
            <option value="subscription">Subscription</option>
            <option value="one-time">One-time</option>
            <option value="therapy">Therapy</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-1">${(stats?.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-yellow-100">Total Revenue</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalPayments || 0}</p>
          <p className="text-gray-600">Total Payments</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            ${stats?.totalPayments > 0 ? (stats.totalRevenue / stats.totalPayments).toFixed(2) : 0}
          </p>
          <p className="text-gray-600">Average Payment</p>
        </Card>
      </div>

      {stats?.byType && Object.keys(stats.byType).length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Payment Type</h2>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, data]) => (
              <div key={type} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 capitalize">{type}</span>
                  <span className="text-lg font-bold text-primary-600">${data.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{data.count} payments</span>
                  <span>Avg: ${(data.amount / data.count).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {stats?.byMonth && Object.keys(stats.byMonth).length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Month</h2>
          <div className="space-y-3">
            {Object.entries(stats.byMonth)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, data]) => (
                <div key={month} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{month}</span>
                    <span className="text-lg font-bold text-primary-600">${data.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{data.count} payments</span>
                    <span>Avg: ${(data.amount / data.count).toFixed(2)}</span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default RevenueStats;
