import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, Home, User, Star, MessageCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const TopBar = ({ onMenuClick }) => {
  const { count, refreshNotifications } = useNotification();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-orange-500 z-50 flex items-center justify-between px-4 shadow-md">
      {/* Hamburger Menu - Not needed on desktop since sidebar is always visible */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
      {!onMenuClick && <div className="w-10" />}

      {/* Right Side Icons */}
      <div className="flex items-center gap-2">
        {/* Home */}
        <Link
          to="/"
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          aria-label={t('nav.home')}
          title={t('nav.home')}
        >
          <Home className="w-6 h-6" />
        </Link>

        {/* Profile */}
        <Link
          to="/child"
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          aria-label={t('nav.profile')}
          title={t('nav.profile')}
        >
          <User className="w-6 h-6" />
        </Link>

        {/* Rating / Feedback (re-use help page as feedback) */}
        <Link
          to="/help"
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          aria-label={t('nav.rating') || 'Rating'}
          title={t('nav.rating') || 'Rating'}
        >
          <Star className="w-6 h-6" />
        </Link>

        {/* Chat with teacher (reuse AI/chat page) */}
        <Link
          to="/ai-chat"
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          aria-label={t('nav.chat') || 'Chat'}
          title={t('nav.chat') || 'Chat'}
        >
          <MessageCircle className="w-6 h-6" />
        </Link>

        <LanguageSwitcher />
        {/* Bell Icon with Notification Badge */}
        <button
          onClick={() => {
            refreshNotifications();
            navigate('/notifications');
          }}
          className="relative text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-orange-500">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>

        {/* Exit/Logout Button */}
        <button
          onClick={handleLogout}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          aria-label="Exit"
          title="Exit"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;

