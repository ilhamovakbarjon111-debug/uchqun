import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart3, TrendingUp, Users, Building2, Star } from 'lucide-react';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/government/overview');
      setStats(res.data?.data || {});
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({});
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
      title: 'Jami Maktablar',
      value: stats?.schools || 0,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      title: 'Jami O\'quvchilar',
      value: stats?.students || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Jami O\'qituvchilar',
      value: stats?.teachers || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Jami Ota-onalar',
      value: stats?.parents || 0,
      icon: Users,
      color: 'bg-orange-500',
    },
    {
      title: 'O\'rtacha Reyting',
      value: (stats?.averageRating || 0).toFixed(1),
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      title: 'Jami Daromad',
      value: `${(stats?.totalRevenue || 0).toLocaleString()} UZS`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistika</h1>
        <p className="text-gray-600">Umumiy statistika va ko'rsatkichlar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Stats;
