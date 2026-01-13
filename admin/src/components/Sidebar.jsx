import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck,
  Shield,
  UsersRound,
  LogOut,
  Crown,
  Building2
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const navigation = [
    { name: t('nav.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('nav.receptions'), href: '/admin/receptions', icon: Shield },
    { name: t('nav.parents'), href: '/admin/parents', icon: Users },
    { name: t('nav.teachers'), href: '/admin/teachers', icon: UserCheck },
    { name: t('nav.groups'), href: '/admin/groups', icon: UsersRound },
    { name: t('nav.schoolRatings'), href: '/admin/school-ratings', icon: Building2 },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 px-6 h-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Crown className="w-5 h-5 text-yellow-300" />
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight">
          Admin
        </h1>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          System Menu
        </p>
        {navigation.map((item) => {
          const Active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                Active
                  ? 'bg-orange-50 text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={onClose}
            >
              <item.icon 
                className={`mr-3 h-5 w-5 transition-colors ${
                  Active ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} 
              />
              <span className="text-sm font-medium">{item.name}</span>
              {Active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold border-2 border-white shadow-sm">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <p className="text-xs text-orange-600 font-semibold mt-0.5">{t('role.admin')}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-2 mb-3">
          <LanguageSwitcher />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all duration-200 shadow-sm active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


