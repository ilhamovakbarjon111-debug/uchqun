import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Image as ImageIcon, 
  LayoutDashboard, 
  LogOut,
  Users,
  Utensils,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../shared/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getUnreadTotalForPrefix } from '../shared/services/chatStore';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
   const { t } = useTranslation();
  const unreadChat = getUnreadTotalForPrefix('parent:', 'teacher');

  const navigation = [
    { name: t('nav.dashboard'), href: '/teacher', icon: LayoutDashboard },
    { name: t('nav.parents'), href: '/teacher/parents', icon: Users },
    { name: t('nav.activities'), href: '/teacher/activities', icon: ClipboardList },
    { name: t('nav.meals'), href: '/teacher/meals', icon: Utensils },
    { name: t('nav.media'), href: '/teacher/media', icon: ImageIcon },
    { name: t('nav.chat'), href: '/teacher/chat', icon: MessageCircle, badge: unreadChat },
  ];

  const isActive = (path) => {
    if (path === '/teacher') {
      return location.pathname === '/teacher';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 px-6 h-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">T</span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight">
          Uchqun
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
                  ? 'bg-orange-50 text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={onClose}
            >
              <div className="relative flex items-center">
                <item.icon 
                  className={`mr-3 h-5 w-5 transition-colors ${
                    Active ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} 
                />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] leading-none font-bold rounded-full px-1.5 py-1 border-2 border-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
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
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all duration-200 shadow-sm active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

