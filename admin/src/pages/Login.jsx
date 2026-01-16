import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Crown, Eye, EyeOff, User, MapPin, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistration, setIsRegistration] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Registration form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassportNumber, setRegPassportNumber] = useState('');
  const [regPassportSeries, setRegPassportSeries] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regRegion, setRegRegion] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Invalid email or password');
    }

    setLoading(false);
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!regFirstName || !regLastName || !regEmail || !regPassportNumber || !regLocation) {
      setError('Iltimos, barcha majburiy maydonlarni to\'ldiring');
      return;
    }

    setRegLoading(true);
    try {
      await api.post('/auth/admin-register', {
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        phone: regPhone,
        passportNumber: regPassportNumber,
        passportSeries: regPassportSeries,
        location: regLocation,
        region: regRegion,
        city: regCity,
      });

      setRegSuccess(true);
      // Reset form
      setRegFirstName('');
      setRegLastName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassportNumber('');
      setRegPassportSeries('');
      setRegLocation('');
      setRegRegion('');
      setRegCity('');
    } catch (error) {
      setError(error.response?.data?.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Crown className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('login.title')}</h1>
          <p className="text-gray-600">{t('login.subtitle')}</p>
        </div>

        {/* Toggle buttons */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setIsRegistration(false);
              setError('');
              setRegSuccess(false);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isRegistration
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('login.tabLogin', { defaultValue: 'Kirish' })}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistration(true);
              setError('');
              setRegSuccess(false);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isRegistration
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('login.tabRegister', { defaultValue: 'Ro\'yxatdan o\'tish' })}
          </button>
        </div>

        {regSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
            {t('login.registrationSuccess', { 
              defaultValue: 'Ariza muvaffaqiyatli yuborildi! Super-admin tasdiqlashidan so\'ng sizga login va parol beriladi.' 
            })}
          </div>
        )}

        {!isRegistration ? (
          <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder={t('login.placeholderEmail')}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder={t('login.placeholderPassword')}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword
                    ? t('login.hidePassword', { defaultValue: 'Hide password' })
                    : t('login.showPassword', { defaultValue: 'Show password' })
                }
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {t('login.loading')}
              </>
            ) : (
              t('login.button')
            )}
          </button>
        </form>

          </form>
        ) : (
          <form onSubmit={handleRegistration} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {t('login.regFirstName', { defaultValue: 'Ism' })} *
                </label>
                <input
                  type="text"
                  required
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('login.regFirstName', { defaultValue: 'Ism' })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {t('login.regLastName', { defaultValue: 'Familiya' })} *
                </label>
                <input
                  type="text"
                  required
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('login.regLastName', { defaultValue: 'Familiya' })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')} *
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.regPhone', { defaultValue: 'Telefon' })}
              </label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+998901234567"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  {t('login.regPassportNumber', { defaultValue: 'Pasport raqami' })} *
                </label>
                <input
                  type="text"
                  required
                  value={regPassportNumber}
                  onChange={(e) => setRegPassportNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="AA1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.regPassportSeries', { defaultValue: 'Pasport seriyasi' })}
                </label>
                <input
                  type="text"
                  value={regPassportSeries}
                  onChange={(e) => setRegPassportSeries(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="AC"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                {t('login.regLocation', { defaultValue: 'Manzil' })} *
              </label>
              <input
                type="text"
                required
                value={regLocation}
                onChange={(e) => setRegLocation(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t('login.regLocationPlaceholder', { defaultValue: 'To\'liq manzil' })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.regRegion', { defaultValue: 'Viloyat' })}
                </label>
                <input
                  type="text"
                  value={regRegion}
                  onChange={(e) => setRegRegion(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Toshkent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.regCity', { defaultValue: 'Shahar' })}
                </label>
                <input
                  type="text"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Toshkent"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-xs mt-4">
              {t('login.regNote', { 
                defaultValue: 'Eslatma: Ma\'lumotlaringiz super-admin tomonidan ko\'rib chiqiladi. Tasdiqlanganidan so\'ng sizga login va parol beriladi.' 
              })}
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
            >
              {regLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('login.regSubmitting', { defaultValue: 'Yuborilmoqda...' })}
                </>
              ) : (
                t('login.regSubmit', { defaultValue: 'Ariza yuborish' })
              )}
            </button>
          </form>
        )}

        {!isRegistration && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p className="font-semibold mb-2">{t('login.blockTitle')}</p>
            <p className="text-xs">{t('login.blockSubtitle')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

