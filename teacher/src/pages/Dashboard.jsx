import { useEffect, useState } from 'react';
import {
  Activity,
  Camera,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import Card from '../shared/components/Card';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import { useAuth } from '../shared/context/AuthContext';
import api from '../shared/services/api';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const parentsRes = await api.get('/teacher/parents').catch(() => ({ data: { parents: [] } }));
        const allParents = Array.isArray(parentsRes.data.parents) ? parentsRes.data.parents : [];
        const parents = user?.id ? allParents.filter((p) => p.teacherId === user.id) : allParents;
        const childIds = parents.flatMap((p) => Array.isArray(p.children) ? p.children.map(c => c.id) : []).filter(Boolean);

        const fetchCount = async (path, key) => {
          const requests = childIds.length
            ? childIds.map((id) => api.get(`${path}?childId=${id}`).catch(() => ({ data: [] })))
            : [api.get(path).catch(() => ({ data: [] }))];
          const responses = await Promise.all(requests);
          return responses.reduce((acc, res) => {
            const data = res.data;
            if (Array.isArray(data)) return acc + data.length;
            if (Array.isArray(data?.[key])) return acc + data[key].length;
            return acc;
          }, 0);
        };

        const [activitiesCount, mealsCount, mediaCount] = await Promise.all([
          fetchCount('/activities', 'activities'),
          fetchCount('/meals', 'meals'),
          fetchCount('/media', 'media'),
        ]);

        setStats({
          activities: activitiesCount,
          meals: mealsCount,
          media: mediaCount,
          parents: parents.length,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const overviewCards = [
    { title: t('dashboard.parents'), value: stats?.parents || 0, icon: Users, href: '/teacher/parents' },
    { title: t('dashboard.activities'), value: stats?.activities || 0, icon: Activity, href: '/teacher/activities' },
    { title: t('dashboard.meals'), value: stats?.meals || 0, icon: UtensilsCrossed, href: '/teacher/meals' },
    { title: t('dashboard.media'), value: stats?.media || 0, icon: Camera, href: '/teacher/media' },
  ];

  // Get role display text based on user role
  const getRoleText = () => {
    if (user?.role === 'admin') {
      return t('dashboard.roleAdmin') || 'My Role: Admin';
    } else if (user?.role === 'teacher') {
      return t('dashboard.roleTeacher') || 'My Role: Teacher';
    }
    return t('dashboard.role') || 'My Role: Teacher';
  };

  return (
    <div className="space-y-6">
      <div className="bg-orange-500 rounded-2xl p-6 md:p-8 -mx-4 md:mx-0">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-white" />
          <p className="text-white/90 text-sm font-medium">{getRoleText()}</p>
        </div>
        <p className="text-white/90 text-sm mb-1">{t('dashboard.welcome')}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {user?.firstName || ''} {user?.lastName || ''}
        </h1>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.overview')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

