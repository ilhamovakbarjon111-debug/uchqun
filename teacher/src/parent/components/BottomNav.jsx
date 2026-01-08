import { Link, useLocation } from 'react-router-dom';
import { Calendar, Image as ImageIcon, CookingPot, Bot} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    { name: t('nav.activities'), href: '/activities', icon: Calendar },
    { name: t('nav.media'), href: '/media', icon: ImageIcon },
    { name: t('nav.meals'), href: '/meals', icon: CookingPot },
    { name: t('nav.aiChat'), href: '/ai-chat', icon: Bot },
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
                active ? 'text-orange-600' : 'text-gray-500'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${active ? 'text-orange-600' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium ${active ? 'text-orange-600' : 'text-gray-500'}`}>
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
