import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Settings } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const TopBar = ({ onMenuClick }) => {
  const { count } = useNotification();
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-blue-500 z-50 flex items-center justify-between px-4 shadow-md">
      {/* Hamburger Menu */}
      <button
        onClick={onMenuClick}
        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        {/* Bell Icon with Notification Badge */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-blue-500">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>

        {/* Settings Icon */}
        <Link
          to="/settings"
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
};

export default TopBar;

