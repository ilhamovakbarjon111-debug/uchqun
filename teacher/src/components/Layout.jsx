import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from '../shared/components/BottomNav';
import LanguageSwitcher from './LanguageSwitcher';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

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
      <div className="lg:pl-64 pb-4 pt-24 lg:pt-4">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

