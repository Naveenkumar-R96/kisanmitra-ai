// frontend/src/components/ui/LanguageSwitcher.jsx
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'hi', label: 'हि', full: 'हिंदी'  },
  { code: 'pa', label: 'ਪੰ', full: 'ਪੰਜਾਬੀ' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('km_lang', code);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1">
      {LANGUAGES.map(lang => (
        <button key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          title={lang.full}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all
            ${i18n.language === lang.code
              ? 'bg-green-600 text-white'
              : 'text-gray-400 hover:text-white'
            }`}>
          {lang.label}
        </button>
      ))}
    </div>
  );
}