import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from '../shared/components/BottomNav';
import TeacherBackground from '../shared/components/TeacherBackground';
import { MessageCircle } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Teacher Background - Elegant lavender theme */}
      <TeacherBackground />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40 pt-4">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pb-24 pt-6 lg:pt-4 relative z-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav
          variant="bottom"
          allowed={[
            '/teacher',
            '/teacher/profile',
          ]}
          showExit={false}
        />
      </div>

      {/* Floating chat button for mobile */}
      {location.pathname !== '/teacher/chat' && (
        <div className="lg:hidden fixed bottom-20 right-4 z-40">
          <a
            href="/teacher/chat"
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition"
            aria-label="Chat"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
        </div>
      )}
    </div>
  );
};

export default Layout;

