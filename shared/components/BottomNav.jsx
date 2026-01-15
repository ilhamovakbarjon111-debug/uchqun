import { Link, useLocation } from 'react-router-dom';
import { Calendar, HelpCircle, Home, Image as ImageIcon, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Activities', href: '/activities', icon: Calendar },
    { name: 'Media', href: '/media', icon: ImageIcon },
    { name: 'Profile', href: '/child', icon: User },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <nav className="flex justify-around items-center h-16">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;

