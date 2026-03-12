import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authSlice';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी',    flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ',  flag: '🌾' },
  { code: 'ta', label: 'தமிழ்',    flag: '🌺' },
  { code: 'te', label: 'తెలుగు',   flag: '🌻' },
  { code: 'mr', label: 'मराठी',    flag: '🏺' },
];

const STATES = [
  'Punjab','Haryana','Uttar Pradesh','Maharashtra','Tamil Nadu',
  'Karnataka','Gujarat','Rajasthan','Madhya Pradesh','Bihar',
  'Andhra Pradesh','Telangana','Kerala','Odisha','Jharkhand',
];

const SOIL_TYPES = ['loamy','clay','sandy','silt','peat','chalky'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', phone: '', password: '',
    language: 'en',
    location: { village: '', district: '', state: '' },
    farmDetails: { landSize: '', soilType: 'loamy', irrigationType: 'rainfed' }
  });
  const { register, isLoading } = useAuthStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const updateLocation = (field, value) => setForm(f => ({ ...f, location: { ...f.location, [field]: value } }));
  const updateFarm = (field, value) => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, [field]: value } }));

  const handleLanguageSelect = (code) => {
    update('language', code);
    i18n.changeLanguage(code);
    localStorage.setItem('km_lang', code);
  };

  const handleSubmit = async () => {
    const ok = await register(form);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-gray-950 to-amber-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🌾</div>
          <h1 className="text-2xl font-bold text-white">{t('appName')}</h1>
          <p className="text-green-400 text-sm">{t('appTagline')}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'bg-green-500' : 'bg-gray-700'}`} />
            </div>
          ))}
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">

          {/* STEP 1 — Language */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-white text-xl font-bold mb-2">{t('selectLanguage')}</h2>
              <p className="text-gray-400 text-sm mb-6">Choose your preferred language / अपनी भाषा चुनें</p>
              <div className="grid grid-cols-3 gap-3">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`p-3 rounded-xl border text-center transition-all
                      ${form.language === lang.code
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-green-600'}`}
                  >
                    <div className="text-2xl mb-1">{lang.flag}</div>
                    <div className="text-xs font-medium">{lang.label}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl mt-6 transition-all active:scale-95"
              >
                {t('next')}
              </button>
            </motion.div>
          )}

          {/* STEP 2 — Personal Info */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-white text-xl font-bold mb-4">{t('personalInfo')}</h2>
              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1.5">👤 {t('fullName')}</label>
                <input
                  type="text"
                  value={form.name}
                  placeholder="Naveen Kumar"
                  onChange={e => update('name', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1.5">📱 {t('phone')}</label>
                <input
                  type="tel"
                  value={form.phone}
                  placeholder="9876543210"
                  onChange={e => update('phone', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1.5">🔒 {t('password')}</label>
                <input
                  type="password"
                  value={form.password}
                  placeholder="••••••••"
                  onChange={e => update('password', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 bg-gray-800 text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-700 transition-all">
                  {t('back')}
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.name || !form.phone || !form.password}
                  className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                >
                  {t('next')}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Farm Details */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-white text-xl font-bold mb-4">{t('farmInfo')}</h2>
              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1.5">🏘️ {t('village')}</label>
                <input
                  type="text"
                  value={form.location.village}
                  placeholder="Village name"
                  onChange={e => updateLocation('village', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1.5">🗺️ {t('state')}</label>
                <select
                  value={form.location.state}
                  onChange={e => updateLocation('state', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all"
                >
                  <option value="">{t('selectState')}</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1.5">🌱 {t('landSize')}</label>
                <input
                  type="number"
                  value={form.farmDetails.landSize}
                  placeholder="3"
                  onChange={e => updateFarm('landSize', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1.5">🪨 {t('soilType')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {SOIL_TYPES.map(s => (
                    <button
                      key={s}
                      onClick={() => updateFarm('soilType', s)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all capitalize
                        ${form.farmDetails.soilType === s
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-amber-600'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="flex-1 bg-gray-800 text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-700 transition-all">
                  {t('back')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                >
                  {isLoading ? '...' : t('getStarted')}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          {t('haveAccount')}{' '}
          <Link to="/login" className="text-green-400 font-semibold hover:text-green-300">
            {t('loginHere')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}