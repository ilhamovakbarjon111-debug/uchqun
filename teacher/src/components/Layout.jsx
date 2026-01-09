import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from '../shared/components/BottomNav';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40 pt-4">
        <Sidebar />
      </div>

      {/* Mobile Top Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40">
        <BottomNav
          variant="top"
          allowed={['/teacher', '/teacher/chat']}
          showLanguageSwitcher
        />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pb-20 pt-24 lg:pt-4">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav
          variant="bottom"
          allowed={[
            '/teacher/activities',
            '/teacher/meals',
            '/teacher/media',
            '/teacher/parents',
          ]}
        />
      </div>
    </div>
  );
};

export default Layout;

