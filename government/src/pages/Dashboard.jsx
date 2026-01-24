import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Building2,
  Users,
  GraduationCap,
  Star,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, schoolsRes] = await Promise.all([
        api.get('/government/overview'),
        api.get('/government/schools?limit=10'),
      ]);

      const overviewData = overviewRes.data.data;
      const schoolsData = schoolsRes.data.data?.schools || [];

      setStats(overviewData);
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const overviewCards = [
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
      icon: GraduationCap,
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
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      title: 'Faol Ogohlantirishlar',
      value: stats?.activeWarnings || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Davlat Nazorat Paneli
        </h1>
        <p className="text-gray-600">
          Xush kelibsiz, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => {
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

      {/* Schools with Ratings */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Maktablar va Baholari</h2>
            <p className="text-sm text-gray-600 mt-1">
              Maktablar reytinglari va statistikasi
            </p>
          </div>
          <BarChart3 className="w-6 h-6 text-gray-400" />
        </div>

        {schools.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Maktablar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schools
              .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
              .map((school) => (
                <div
                  key={school.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-900">{school.name}</h3>
                      </div>
                      {school.address && (
                        <p className="text-sm text-gray-600 mb-2">{school.address}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>O'quvchilar: {school.studentsCount || 0}</span>
                        <span>Baholar: {school.ratingsCount || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(school.averageRating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-bold text-gray-900 ml-2">
                        {(school.averageRating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
