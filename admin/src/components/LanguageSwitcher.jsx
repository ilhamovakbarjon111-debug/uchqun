import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language || 'uz';

  const handleChange = (e) => {
    changeLanguage(e.target.value);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className="px-2 py-1 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label="Select language"
    >
      <option value="uz">UZ</option>
      <option value="ru">RU</option>
      <option value="en">EN</option>
    </select>
  );
};

export default LanguageSwitcher;


