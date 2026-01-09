import { LogOut } from 'lucide-react';
import { useAuth } from '../shared/context/AuthContext';
import Card from '../shared/components/Card';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Profile</h1>
          <p className="text-gray-500 text-sm">Manage your account</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('nav.logout')}
        </button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xl font-bold">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-xs uppercase text-gray-400 font-bold">Role</div>
            <div className="text-gray-900 font-semibold mt-1">{user?.role}</div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-xs uppercase text-gray-400 font-bold">ID</div>
            <div className="text-gray-900 font-semibold mt-1">{user?.id}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;

