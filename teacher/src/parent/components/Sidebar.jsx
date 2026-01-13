import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UserCircle,
  ClipboardList,
  Utensils,
  Image as ImageIcon,
  Bot,
  Star,
  MessageCircle,
  Bell,
  Building2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { count, refreshNotifications } = useNotification();

  const navigation = [
    { name: t('nav.home'), href: '/', icon: LayoutDashboard },
    { name: t('nav.profile'), href: '/child', icon: UserCircle },
    { name: t('nav.activities'), href: '/activities', icon: ClipboardList },
    { name: t('nav.meals'), href: '/meals', icon: Utensils },
    { name: t('nav.media'), href: '/media', icon: ImageIcon },
    { name: t('nav.rating'), href: '/rating', icon: Star },
    { name: t('nav.schoolRating'), href: '/school-rating', icon: Building2 },
    { name: t('nav.aiChat'), href: '/ai-chat', icon: Bot },
    { name: t('nav.chat'), href: '/chat', icon: MessageCircle },
    { name: t('nav.notifications', { defaultValue: 'Notifications' }), href: '/notifications', icon: Bell, badge: count },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-100 shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 h-20 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">U</span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight">
          Uchqun Platform
        </h1>
      </div>

      {/* Navigation */}
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
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => {
                if (item.href === '/notifications') refreshNotifications();
                onClose?.();
              }}
            >
              <div className="relative flex items-center">
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors ${
                    Active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] leading-none font-extrabold rounded-full px-1.5 py-1 border-2 border-white shadow-sm">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">{item.name}</span>
              {Active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;