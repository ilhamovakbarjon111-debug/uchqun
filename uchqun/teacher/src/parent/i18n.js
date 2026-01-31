// Parent side reuses the shared i18n instance to keep one source of truth
// for translations (avoids re-init overriding teacher translations).
import i18n, { changeLanguage } from '../i18n';

export { changeLanguage };
export default i18n;
