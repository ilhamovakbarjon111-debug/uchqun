import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MessageModal from './MessageModal';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Only visible on large screens */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
        <Sidebar onMessageClick={() => setShowMessageModal(true)} />
      </div>

      {/* Mobile Sidebar Overlay - Only visible on small screens */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Only visible on small screens */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} onMessageClick={() => {
          setShowMessageModal(true);
          setSidebarOpen(false);
        }} />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation - Visible on small screens (mobile/zoomed out) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>

      {/* Message Modal */}
      {showMessageModal && <MessageModal onClose={() => setShowMessageModal(false)} />}
    </div>
  );
};

export default Layout;

