import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import DecorativeBackground from '../../shared/components/DecorativeBackground';
import { MessageCircle } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: '#3C9DE1',
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 30%),
        radial-gradient(ellipse at 80% 80%, rgba(255, 165, 0, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(255, 140, 0, 0.15) 0%, transparent 40%),
        radial-gradient(ellipse at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 35%),
        radial-gradient(ellipse at 80% 80%, rgba(255, 69, 0, 0.1) 0%, transparent 30%),
        linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, transparent 50%),
        linear-gradient(45deg, rgba(41, 128, 185, 0.08) 0%, transparent 50%),
        linear-gradient(225deg, rgba(46, 134, 193, 0.06) 0%, transparent 50%)
      `
    }}>
      {/* Abstract geometric patterns overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 100 Q 50 50 100 100 T 200 100' stroke='rgba(255,255,255,0.1)' fill='none' stroke-width='2'/%3E%3Cpath d='M 0 100 Q 50 150 100 100 T 200 100' stroke='rgba(255,255,255,0.08)' fill='none' stroke-width='2'/%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg width='150' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='75' cy='75' r='60' stroke='rgba(41,128,185,0.15)' fill='none' stroke-width='1.5' stroke-dasharray='5,5'/%3E%3Ccircle cx='75' cy='75' r='40' stroke='rgba(41,128,185,0.12)' fill='none' stroke-width='1' stroke-dasharray='3,3'/%3E%3Ccircle cx='75' cy='75' r='20' stroke='rgba(41,128,185,0.1)' fill='none' stroke-width='1'/%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg width='180' height='180' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 90 90 L 90 10 A 80 80 0 0 1 170 90 Z' fill='rgba(52,152,219,0.08)'/%3E%3Cpath d='M 90 90 L 10 90 A 80 80 0 0 1 90 10 Z' fill='rgba(46,134,193,0.06)'/%3E%3C/svg%3E")
        `,
        backgroundSize: '400px 400px, 300px 300px, 360px 360px',
        backgroundPosition: 'top left, center, bottom right',
        opacity: 0.6
      }}></div>

      {/* Top-left concentric arcs pattern */}
      <div className="fixed top-0 left-0 w-96 h-96 pointer-events-none" style={{
        background: `
          radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.25) 31%, rgba(255,255,255,0.25) 32%, transparent 33%),
          radial-gradient(circle at center, transparent 40%, rgba(255,255,255,0.2) 41%, rgba(255,255,255,0.2) 42%, transparent 43%),
          radial-gradient(circle at center, transparent 50%, rgba(255,255,255,0.15) 51%, rgba(255,255,255,0.15) 52%, transparent 53%),
          radial-gradient(circle at center, transparent 60%, rgba(255,255,255,0.1) 61%, rgba(255,255,255,0.1) 62%, transparent 63%)
        `,
        clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        transform: 'translate(-30%, -30%)'
      }}></div>

      {/* Bottom-right spiral/arcs pattern */}
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] pointer-events-none" style={{
        background: `
          conic-gradient(from 180deg at 80% 80%, rgba(255,165,0,0.3) 0deg, transparent 60deg, rgba(255,140,0,0.25) 120deg, transparent 180deg, rgba(255,255,255,0.2) 240deg, transparent 300deg, rgba(255,69,0,0.2) 360deg),
          radial-gradient(ellipse at 80% 80%, rgba(255,165,0,0.2) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(255,140,0,0.15) 0%, transparent 40%),
          radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 35%)
        `,
        clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        transform: 'translate(20%, 20%)'
      }}></div>

      {/* Decorative Icons Background */}
      <DecorativeBackground />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pb-24 lg:pb-6 pt-8 lg:pt-8 relative z-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation - Only visible on mobile (small screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>

      {/* Floating chat button (hide on chat page) */}
      {location.pathname !== '/chat' && (
        <div className="lg:hidden fixed bottom-20 right-4 z-50">
          <a
            href="/chat"
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
