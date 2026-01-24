import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  Building2,
  DollarSign,
  Activity,
  TrendingUp,
  Crown,
  Trophy,
  BarChart3,
  Shield,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [receptions, setReceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch statistics and receptions from backend API
        const [statsResponse, receptionsResponse] = await Promise.all([
          api.get('/admin/statistics').catch(() => null),
          api.get('/admin/receptions').catch(() => ({ data: { data: [] } })),
        ]);
        
        const receptionsData = receptionsResponse?.data?.data || [];
        
        if (statsResponse?.data?.data) {
          const statsData = statsResponse.data.data;
          setStats({
            totalUsers: statsData.totalUsers,
            totalSchools: statsData.totalSchools,
            totalRevenue: statsData.totalRevenue,
            therapyUsages: statsData.therapyUsages,
            activeSubscriptions: statsData.activeSubscriptions,
            receptions: receptionsData.length,
            pendingReceptions: receptionsData.filter(r => !r.isActive || !r.documentsApproved).length,
            parents: statsData.parents,
            teachers: statsData.teachers,
            groups: statsData.groups,
            pendingDocuments: statsData.pendingDocuments,
          });
        } else {
          // Fallback to individual API calls if statistics endpoint fails
          try {
            const [receptionsRes, parentsRes, teachersRes, groupsRes, pendingDocsRes] = await Promise.all([
              api.get('/admin/receptions').catch(() => ({ data: { data: [] } })),
              api.get('/admin/parents').catch(() => ({ data: { data: [] } })),
              api.get('/admin/teachers').catch(() => ({ data: { data: [] } })),
              api.get('/admin/groups').catch(() => ({ data: { groups: [] } })),
              api.get('/admin/documents/pending').catch(() => ({ data: { data: [] } })),
            ]);

            const receptionsData = receptionsRes.data.data || [];
            const parents = parentsRes.data.data || [];
            const teachers = teachersRes.data.data || [];
            const groups = groupsRes.data.groups || [];
            const pendingDocs = pendingDocsRes.data.data || [];

            setStats({
              receptions: receptionsData.length,
              pendingReceptions: receptionsData.filter(r => !r.isActive || !r.documentsApproved).length,
              parents: parents.length,
              teachers: teachers.length,
              groups: groups.length,
              pendingDocuments: pendingDocs.length,
            });
            setReceptions(receptionsData);
          } catch (fallbackError) {
            console.error('Error loading fallback data:', fallbackError);
          }
        }
        setReceptions(receptionsData);
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
    { 
      title: t('dashboard.totalUsers', { defaultValue: 'Total Users' }), 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'bg-blue-50 text-blue-600', 
      link: '/admin/users' 
    },
    { 
      title: t('dashboard.totalSchools', { defaultValue: 'Total Schools' }), 
      value: stats?.totalSchools || 0, 
      icon: Building2, 
      color: 'bg-green-50 text-green-600', 
      link: '/admin/statistics' 
    },
    { 
      title: t('dashboard.totalRevenue', { defaultValue: 'Total Revenue' }), 
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: 'bg-yellow-50 text-yellow-600', 
      link: '/admin/revenue' 
    },
    { 
      title: t('dashboard.therapyUsages', { defaultValue: 'Therapy Usages' }), 
      value: stats?.therapyUsages || 0, 
      icon: Activity, 
      color: 'bg-purple-50 text-purple-600', 
      link: '/admin/usage' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 md:p-8 -mx-4 md:mx-0">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-8 h-8 text-yellow-300" />
          <p className="text-white/90 text-sm font-medium">{t('dashboard.role')}</p>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {t('dashboard.welcome', { name: user?.firstName || 'Business', defaultValue: `Welcome, ${user?.firstName || 'Business'}` })}
        </h1>
        <p className="text-white/80 text-sm mt-2">{t('dashboard.subtitle', { defaultValue: 'Business Statistics & Analytics Dashboard' })}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.overview')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {overviewCards.map((card) => (
            <Link key={card.title} to={card.link}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${card.color}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    {card.subtitle && (
                      <p className="text-xs text-primary-600 mt-1">{card.subtitle}</p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">{t('dashboard.systemStats', { defaultValue: 'System Overview' })}</h3>
            <p className="text-white/90 text-sm mb-4">
              {stats?.totalUsers !== undefined 
                ? t('dashboard.totalUsers', { 
                    count: stats?.totalUsers || 0,
                    defaultValue: `Total Users: ${stats?.totalUsers || 0} | Schools: ${stats?.totalSchools || 0} | Revenue: $${(stats?.totalRevenue || 0).toLocaleString()}`
                  })
                : t('dashboard.totalUsers', {
                    count: (stats?.parents || 0) + (stats?.teachers || 0) + (stats?.receptions || 0),
                    active: (stats?.receptions || 0) - (stats?.pendingReceptions || 0),
                    groups: stats?.groups || 0,
                    defaultValue: `Users: ${(stats?.parents || 0) + (stats?.teachers || 0) + (stats?.receptions || 0)} | Active Receptions: ${(stats?.receptions || 0) - (stats?.pendingReceptions || 0)} | Groups: ${stats?.groups || 0}`
                  })
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Receptions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.receptionsList', { defaultValue: 'Receptions List' })}</h2>
          <Link to="/admin/receptions" className="text-sm text-primary-600 hover:underline">
            {t('common.viewAll', { defaultValue: 'View All' })}
          </Link>
        </div>
        {receptions.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="divide-y divide-gray-100">
              {receptions.slice(0, 5).map((reception) => (
                <div key={reception._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                      {reception.firstName?.charAt(0)}{reception.lastName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{reception.firstName} {reception.lastName}</p>
                      <p className="text-sm text-gray-500">{reception.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reception.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {reception.isActive ? t('common.active', { defaultValue: 'Active' }) : t('common.pending', { defaultValue: 'Pending' })}
                    </span>
                    <Link
                      to={`/admin/receptions/${reception._id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('dashboard.noReceptions', { defaultValue: 'No receptions yet' })}</p>
            <Link
              to="/admin/receptions/new"
              className="inline-block mt-3 text-primary-600 hover:underline text-sm"
            >
              {t('dashboard.addReception', { defaultValue: 'Add Reception' })}
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

