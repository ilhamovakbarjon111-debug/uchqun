import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import LanguageSwitcher from './LanguageSwitcher';
import { Bell, MessageCircle, LogOut } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { count, refreshNotifications } = useNotification();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Language + notifications top right */}
      <div className="fixed top-2 right-3 z-50 flex items-center gap-2">
        <button
          onClick={() => {
            refreshNotifications();
            navigate('/notifications');
          }}
          className="relative p-2 rounded-full bg-white shadow border border-gray-200 text-gray-700 hover:bg-gray-50"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none font-bold rounded-full px-1.5 py-1 border-2 border-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="p-2 rounded-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <LanguageSwitcher />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pb-24 lg:pb-6 pt-8 lg:pt-8">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation - Only visible on mobile (small screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>

      {/* Floating chat button */}
      <div className="lg:hidden fixed bottom-20 right-4 z-50">
        <a
          href="/chat"
          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition"
          aria-label="Chat"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
};

export default Layout;
