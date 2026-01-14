import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  UserCheck,
  Shield,
  UsersRound,
  BarChart3,
  Crown,
  Trophy,
  FileText,
  Clock,
  CheckCircle,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch statistics from backend API
        const response = await api.get('/admin/statistics');
        const statsData = response.data.data;

        setStats({
          receptions: statsData.receptions.total,
          pendingReceptions: statsData.receptions.pending,
          parents: statsData.users.parents,
          teachers: statsData.users.teachers,
          groups: statsData.groups.total,
          pendingDocuments: statsData.documents.pending,
          totalUsers: statsData.users.total,
          activeReceptions: statsData.receptions.active,
          inactiveReceptions: statsData.receptions.inactive,
          totalContent: statsData.content.total,
          recentActivity: statsData.recentActivity,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to individual API calls if statistics endpoint fails
        try {
          const [receptionsRes, parentsRes, teachersRes, groupsRes, pendingDocsRes] = await Promise.all([
            api.get('/admin/receptions').catch(() => ({ data: { data: [] } })),
            api.get('/admin/parents').catch(() => ({ data: { data: [] } })),
            api.get('/admin/teachers').catch(() => ({ data: { data: [] } })),
            api.get('/admin/groups').catch(() => ({ data: { groups: [] } })),
            api.get('/admin/documents/pending').catch(() => ({ data: { data: [] } })),
          ]);

          const receptions = receptionsRes.data.data || [];
          const parents = parentsRes.data.data || [];
          const teachers = teachersRes.data.data || [];
          const groups = groupsRes.data.groups || [];
          const pendingDocs = pendingDocsRes.data.data || [];

          setStats({
            receptions: receptions.length,
            pendingReceptions: receptions.filter(r => !r.isActive || !r.documentsApproved).length,
            parents: parents.length,
            teachers: teachers.length,
            groups: groups.length,
            pendingDocuments: pendingDocs.length,
          });
        } catch (fallbackError) {
          console.error('Error loading fallback data:', fallbackError);
        }
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
      title: t('dashboard.receptionCard'), 
      value: stats?.receptions || 0, 
      icon: Shield, 
      color: 'bg-purple-50 text-purple-600', 
      link: '/admin/receptions',
      subtitle: `${stats?.pendingReceptions || 0} ${t('dashboard.pending').toLowerCase()}`
    },
    { 
      title: t('dashboard.parentsCard'), 
      value: stats?.parents || 0, 
      icon: Users, 
      color: 'bg-green-50 text-green-600', 
      link: '/admin/parents' 
    },
    { 
      title: t('dashboard.teachersCard'), 
      value: stats?.teachers || 0, 
      icon: UserCheck, 
      color: 'bg-blue-50 text-blue-600', 
      link: '/admin/teachers' 
    },
    { 
      title: t('dashboard.groupsCard'), 
      value: stats?.groups || 0, 
      icon: UsersRound, 
      color: 'bg-primary-50 text-primary-600', 
      link: '/admin/groups' 
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
          {t('dashboard.welcome', { name: user?.firstName || 'Admin' })}
        </h1>
        <p className="text-white/80 text-sm mt-2">{t('dashboard.subtitle')}</p>
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

      {/* My Assignments - Pending Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.pending')}</h2>
        <div className="space-y-4 mb-6">
          {stats?.pendingDocuments > 0 && (
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{t('dashboard.pendingDocuments')}</h3>
                  <p className="text-white/90 text-sm mb-4">
                    {t('dashboard.pendingDocumentsDesc', { count: stats.pendingDocuments })}
                  </p>
                  <Link 
                    to="/admin/receptions"
                    className="inline-block px-4 py-2 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-colors"
                  >
                    {t('dashboard.reviewDocuments')}
                  </Link>
                </div>
              </div>
            </Card>
          )}
          {stats?.pendingReceptions > 0 && (
            <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{t('dashboard.pendingReceptions')}</h3>
                  <p className="text-white/90 text-sm mb-4">
                    {t('dashboard.pendingReceptionsDesc', { count: stats.pendingReceptions })}
                  </p>
                  <Link 
                    to="/admin/receptions"
                    className="inline-block px-4 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                  >
                    {t('dashboard.reviewReceptions')}
                  </Link>
                </div>
              </div>
            </Card>
          )}
          {(!stats?.pendingDocuments && !stats?.pendingReceptions) && (
            <Card className="p-6 bg-green-50 border border-green-200">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-1">{t('dashboard.allClear')}</h3>
                  <p className="text-green-700 text-sm">{t('dashboard.noPending')}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">{t('dashboard.systemStats')}</h3>
            <p className="text-white/90 text-sm mb-4">
              {t('dashboard.totalUsers', { 
                count: (stats?.parents || 0) + (stats?.teachers || 0) + (stats?.receptions || 0),
                active: stats?.receptions - (stats?.pendingReceptions || 0),
                groups: stats?.groups || 0
              })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

