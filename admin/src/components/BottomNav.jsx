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
  User
} from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const navigation = [
    { name: t('nav.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('mobileNav.reception'), href: '/admin/receptions', icon: Shield },
    { name: t('nav.parents'), href: '/admin/parents', icon: Users },
    { name: t('nav.teachers'), href: '/admin/teachers', icon: UserCheck },
    { name: t('nav.groups'), href: '/admin/groups', icon: UsersRound },
    { name: t('nav.profile', { defaultValue: 'Profile' }), href: '/admin/profile', icon: User },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <nav className="flex justify-around items-center h-16">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-orange-600' : 'text-gray-500'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${active ? 'text-orange-600' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium ${active ? 'text-orange-600' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
        {/* Exit Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full transition-colors text-red-600 hover:text-red-700"
          aria-label="Exit"
        >
          <LogOut className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">{t('mobileNav.exit')}</span>
        </button>
      </nav>
    </div>
  );
};

export default BottomNav;

