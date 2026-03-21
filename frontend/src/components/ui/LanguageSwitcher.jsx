import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN',  full: 'English'  },
  { code: 'hi', label: 'हि',  full: 'हिंदी'    },
  { code: 'pa', label: 'ਪੰ',  full: 'ਪੰਜਾਬੀ'  },
  { code: 'ta', label: 'த',   full: 'தமிழ்'    },
  { code: 'te', label: 'తె',  full: 'తెలుగు'   },
  { code: 'mr', label: 'म',   full: 'मराठी'    },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = async (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('km_lang', code);
  
    // Also update user profile in backend
    try {
      const token = localStorage.getItem('km_token');
      if (token) {
        await fetch('/api/auth/update-profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ language: code })
        });
      }
    } catch (e) {
      console.log('Language update failed:', e);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 bg-gray-800 rounded-xl p-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          title={lang.full}
          className={`px-2 py-1 rounded-lg text-xs font-bold transition-all
            ${i18n.language === lang.code
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}