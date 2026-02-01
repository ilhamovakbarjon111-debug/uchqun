import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language || 'en';

  const handleChange = (e) => {
    changeLanguage(e.target.value);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Language"
    >
      <option value="en">EN</option>
      <option value="uz">UZ</option>
      <option value="ru">RU</option>
    </select>
  );
};

export default LanguageSwitcher;


