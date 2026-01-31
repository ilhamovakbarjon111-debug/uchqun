import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  Shield,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Reception Dashboard - Updated to use correct endpoints
        const [
          parentsRes,
          teachersRes,
          groupsRes,
        ] = await Promise.allSettled([
          api.get('/reception/parents'),
          api.get('/reception/teachers'),
          api.get('/groups'),
        ]);

        const parents = parentsRes.status === 'fulfilled' && parentsRes.value.data?.data && Array.isArray(parentsRes.value.data.data) 
          ? parentsRes.value.data.data 
          : [];
        const teachers = teachersRes.status === 'fulfilled' && teachersRes.value.data?.data && Array.isArray(teachersRes.value.data.data) 
          ? teachersRes.value.data.data 
          : [];
        const groups = groupsRes.status === 'fulfilled' && groupsRes.value.data?.groups && Array.isArray(groupsRes.value.data.groups) 
          ? groupsRes.value.data.groups 
          : [];

        setStats({
          parents: parents.length,
          teachers: teachers.length,
          groups: groups.length,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default stats if error occurs
        setStats({
          parents: 0,
          teachers: 0,
          groups: 0,
        });
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 md:p-8 -mx-4 md:mx-0">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-white" />
          <p className="text-white/90 text-sm font-medium">{t('dashboard.role')}</p>
        </div>
        <p className="text-white/90 text-sm mb-1">{t('dashboard.welcome')}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {user?.firstName || ''} {user?.lastName || ''}
        </h1>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.stats')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('dashboard.totalParents')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.parents || 0}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('dashboard.totalTeachers')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.teachers || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('dashboard.totalGroups')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.groups || 0}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-xl">
                <UsersRound className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
