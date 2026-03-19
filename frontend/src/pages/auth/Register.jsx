// frontend/src/pages/auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authSlice';

const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🌾' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ta', label: 'தமிழ்', flag: '🌺' },
  { code: 'te', label: 'తెలుగు', flag: '🌻' },
  { code: 'mr', label: 'मराठी', flag: '🏺' },
];

const STATES = ['Punjab','Haryana','Uttar Pradesh','Maharashtra','Tamil Nadu',
                'Karnataka','Gujarat','Rajasthan','Madhya Pradesh','Bihar'];

const SOIL_TYPES = ['loamy','clay','sandy','silt','peat','chalky'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', phone: '', password: '',
    language: 'hi',
    location: { village: '', district: '', state: '' },
    farmDetails: { landSize: '', soilType: 'loamy', irrigationType: 'rainfed' }
  });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const updateLocation = (field, value) =>
    setForm(f => ({ ...f, location: { ...f.location, [field]: value } }));
  const updateFarm = (field, value) =>
    setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, [field]: value } }));

  const handleSubmit = async () => {
    const ok = await register(form);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-gray-950 to-amber-950 
                    flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center 
                          text-3xl mx-auto mb-3">🌾</div>
          <h1 className="text-2xl font-bold text-white">KisanMitra AI</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-300
                ${s <= step ? 'bg-green-500' : 'bg-gray-700'}`} />
            </div>
          ))}
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 
                        rounded-3xl p-8 shadow-2xl">

          {/* STEP 1 — Language Selection */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-white text-xl font-bold mb-2">भाषा चुनें</h2>
              <p className="text-gray-400 text-sm mb-6">Select your preferred language</p>
              <div className="grid grid-cols-3 gap-3">
                {LANGUAGES.map(lang => (
                  <button key={lang.code}
                    onClick={() => update('language', lang.code)}
                    className={`p-3 rounded-xl border text-center transition-all
                      ${form.language === lang.code
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-green-600'
                      }`}
                  >
                    <div className="text-2xl mb-1">{lang.flag}</div>
                    <div className="text-xs font-medium">{lang.label}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold 
                           py-4 rounded-xl mt-6 transition-all active:scale-95">
                अगला →
              </button>
            </motion.div>
          )}

          {/* STEP 2 — Personal Info */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-4">
              <h2 className="text-white text-xl font-bold mb-4">व्यक्तिगत जानकारी</h2>

              {[
                { label: '👤 पूरा नाम', field: 'name', type: 'text', placeholder: 'Naveen Kumar' },
                { label: '📱 फोन नंबर', field: 'phone', type: 'tel', placeholder: '9876543210' },
                { label: '🔒 पासवर्ड', field: 'password', type: 'password', placeholder: '••••••••' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="text-gray-400 text-sm font-medium block mb-1.5">{label}</label>
                  <input type={type} value={form[field]} placeholder={placeholder}
                    onChange={e => update(field, e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                               text-white placeholder-gray-500 focus:outline-none focus:border-green-500 
                               focus:ring-1 focus:ring-green-500 transition-all" />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 bg-gray-800 text-gray-300 font-bold py-3 rounded-xl 
                             hover:bg-gray-700 transition-all">
                  ← वापस
                </button>
                <button onClick={() => setStep(3)}
                  disabled={!form.name || !form.phone || !form.password}
                  className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-green-900 
                             text-white font-bold py-3 rounded-xl transition-all active:scale-95">
                  अगला →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Farm Details */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-4">
              <h2 className="text-white text-xl font-bold mb-4">खेती की जानकारी</h2>

              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1.5">🏘️ गांव</label>
                <input type="text" value={form.location.village} placeholder="गांव का नाम"
                  onChange={e => updateLocation('village', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                             text-white placeholder-gray-500 focus:outline-none focus:border-green-500 
                             focus:ring-1 focus:ring-green-500 transition-all" />
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1.5">🗺️ राज्य</label>
                <select value={form.location.state}
                  onChange={e => updateLocation('state', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                             text-white focus:outline-none focus:border-green-500 transition-all">
                  <option value="">राज्य चुनें</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1.5">
                  🌱 जमीन (एकड़ में)
                </label>
                <input type="number" value={form.farmDetails.landSize} placeholder="3"
                  onChange={e => updateFarm('landSize', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                             text-white placeholder-gray-500 focus:outline-none focus:border-green-500 
                             focus:ring-1 focus:ring-green-500 transition-all" />
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium block mb-1.5">🪨 मिट्टी का प्रकार</label>
                <div className="grid grid-cols-3 gap-2">
                  {SOIL_TYPES.map(s => (
                    <button key={s} onClick={() => updateFarm('soilType', s)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all capitalize
                        ${form.farmDetails.soilType === s
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-amber-600'
                        }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)}
                  className="flex-1 bg-gray-800 text-gray-300 font-bold py-3 rounded-xl 
                             hover:bg-gray-700 transition-all">
                  ← वापस
                </button>
                <button onClick={handleSubmit} disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-green-900 
                             text-white font-bold py-3 rounded-xl transition-all active:scale-95">
                  {isLoading ? '...' : '🌾 शुरू करें'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          पहले से खाता है?{' '}
          <Link to="/login" className="text-green-400 font-semibold hover:text-green-300">
            लॉगिन करें
          </Link>
        </p>
      </motion.div>
    </div>
  );
}