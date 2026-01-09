import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useChild } from '../context/ChildContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Activity,
  UtensilsCrossed,
  Camera,
  Users,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedChildId } = useChild();
  const { refreshNotifications } = useNotification();
  const [child, setChild] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!selectedChildId) return;
    
    const loadData = async () => {
      try {
        const [childResponse, activitiesResponse, mealsResponse, mediaResponse] = await Promise.all([
          api.get(`/child/${selectedChildId}`).catch(() => ({ data: null })),
          api.get(`/activities?limit=5&childId=${selectedChildId}`).catch(() => ({ data: { activities: [] } })),
          api.get(`/meals?limit=5&childId=${selectedChildId}`).catch(() => ({ data: { meals: [] } })),
          api.get(`/media?limit=5&childId=${selectedChildId}`).catch(() => ({ data: { media: [] } })),
        ]);

        const childData = childResponse.data;
        const activities = activitiesResponse.data?.activities || activitiesResponse.data || [];
        const meals = mealsResponse.data?.meals || mealsResponse.data || [];
        const media = mediaResponse.data?.media || mediaResponse.data || [];

        setChild(childData);
        setStats({
          activities: Array.isArray(activities) ? activities.length : 0,
          meals: Array.isArray(meals) ? meals.length : 0,
          media: Array.isArray(media) ? media.length : 0,
          recentActivity: Array.isArray(activities) && activities.length > 0 ? activities[0] : null,
        });
        
        // Refresh notifications after loading data
        refreshNotifications();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedChildId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const overviewCards = [
    {
      title: t('dashboard.activities'),
      value: stats?.activities || 0,
      icon: Activity,
      href: '/activities',
    },
    {
      title: t('dashboard.mealsTracked'),
      value: stats?.meals || 0,
      icon: UtensilsCrossed,
      href: '/meals',
    },
    {
      title: t('dashboard.photos'),
      value: stats?.media || 0,
      icon: Camera,
      href: '/media',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Orange Header Section */}
      <div className="bg-orange-500 rounded-2xl p-6 md:p-8 -mx-4 md:mx-0">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-white" />
          <p className="text-white/90 text-sm font-medium">{t('dashboard.role')}</p>
        </div>
        <p className="text-white/90 text-sm mb-1">{t('dashboard.welcome')}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {user?.firstName || ''} {user?.lastName || ''}
        </h1>
      </div>

      {/* Overview Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.overview')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {overviewCards.map((card) => (
            <Card key={card.title} className="p-4 hover:shadow-lg transition">
              <a href={card.href} className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-xl">
                  <card.icon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-600">{card.title}</p>
                </div>
              </a>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
