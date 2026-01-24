import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Activity,
  Play,
  Video,
  Music,
  FileText,
  TrendingUp,
} from 'lucide-react';

const UsageStats = () => {
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
      const response = await api.get('/business/usage', {
        params: dateRange,
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading usage statistics:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Usage Statistics</h1>
          <p className="text-gray-600 mt-1">Track therapy and content usage analytics</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-purple-400 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold mb-1">{stats?.totalUsages || 0}</p>
          <p className="text-purple-100">Total Therapy Usages</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Play className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {stats?.byTherapy ? Object.keys(stats.byTherapy).length : 0}
          </p>
          <p className="text-gray-600">Active Therapy Types</p>
        </Card>
      </div>

      {stats?.byTherapy && Object.keys(stats.byTherapy).length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage by Therapy Type</h2>
          <div className="space-y-3">
            {Object.entries(stats.byTherapy)
              .sort(([, a], [, b]) => b - a)
              .map(([therapyId, count]) => (
                <div key={therapyId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Play className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Therapy #{therapyId}</p>
                        <p className="text-sm text-gray-600">Therapy session</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">{count}</p>
                      <p className="text-sm text-gray-600">usages</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {(!stats?.byTherapy || Object.keys(stats.byTherapy).length === 0) && (
        <Card className="p-12 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Usage Data</h3>
          <p className="text-gray-600">No therapy usage data available for the selected period.</p>
        </Card>
      )}
    </div>
  );
};

export default UsageStats;
