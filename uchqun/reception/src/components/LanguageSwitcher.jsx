import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const current = i18n.language || 'en';

  const handleChange = (e) => {
    changeLanguage(e.target.value);
  };

  return (
    <div className="inline-flex items-center gap-2 bg-white text-gray-700 rounded-lg px-2 py-1 shadow-sm border border-gray-200">
      <select
        value={current}
        onChange={handleChange}
        className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
        aria-label={t('language')}
      >
        <option value="en">EN</option>
        <option value="uz">UZ</option>
        <option value="ru">RU</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;


