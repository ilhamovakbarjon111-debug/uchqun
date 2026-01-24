import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
} from 'lucide-react';

const BusinessStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/business/overview', {
        params: dateRange,
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      change: '+12%',
    },
    {
      title: 'Total Schools',
      value: stats?.totalSchools || 0,
      icon: Building2,
      color: 'bg-green-50 text-green-600',
      change: '+5%',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-50 text-yellow-600',
      change: '+23%',
    },
    {
      title: 'Therapy Usages',
      value: stats?.therapyUsages || 0,
      icon: Activity,
      color: 'bg-purple-50 text-purple-600',
      change: '+18%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Statistics</h1>
          <p className="text-gray-600 mt-1">Overview of your business metrics</p>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-green-600">{card.change}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
            <p className="text-sm text-gray-600">{card.title}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Detailed Analytics</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Active Subscriptions</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.activeSubscriptions || 0}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-2">User Growth</p>
              <p className="text-xl font-bold text-blue-900">+12% this month</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-2">Revenue Growth</p>
              <p className="text-xl font-bold text-green-900">+23% this month</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BusinessStats;
