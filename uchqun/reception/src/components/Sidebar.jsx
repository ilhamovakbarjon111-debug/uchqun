import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck,
  UsersRound,
  Shield,
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const navigation = [
    { name: t('nav.dashboard'), href: '/reception', icon: LayoutDashboard },
    { name: t('nav.parents'), href: '/reception/parents', icon: Users },
    { name: t('nav.teachers'), href: '/reception/teachers', icon: UserCheck },
    { name: t('nav.groups'), href: '/reception/groups', icon: UsersRound },
    { name: t('nav.profile', { defaultValue: 'Profile' }), href: '/reception/profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 px-6 h-20 bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight">
          Uchqun Reception
        </h1>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {t('nav.menu')}
        </p>
        {navigation.map((item) => {
          const Active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                Active
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={onClose}
            >
              <item.icon 
                className={`mr-3 h-5 w-5 transition-colors ${
                  Active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} 
              />
              <span className="text-sm font-medium">{item.name}</span>
              {Active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <p className="text-xs text-primary-600 font-semibold mt-0.5">Reception</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
