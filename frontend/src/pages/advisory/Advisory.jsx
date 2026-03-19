// frontend/src/pages/advisory/Advisory.jsx
import { motion } from 'framer-motion';

const ADVISORIES = [
  {
    id: 1, emoji: '🌧️', type: 'weather_alert', priority: 'high',
    title: 'बारिश की संभावना',
    message: 'अगले 24 घंटों में 15mm बारिश हो सकती है। कोई भी छिड़काव न करें।',
    actions: ['सिंचाई बंद करें', 'फसल की निगरानी करें', 'नाली साफ रखें'],
    crop: 'गेहूं', stage: 'vegetative', date: 'आज'
  },
  {
    id: 2, emoji: '🌱', type: 'fertilizer', priority: 'medium',
    title: 'यूरिया उर्वरक डालें',
    message: 'फसल की पत्तियां हल्की पीली हो रही हैं — नाइट्रोजन की कमी के लक्षण।',
    actions: ['50 kg/एकड़ यूरिया डालें', 'सुबह या शाम डालें', 'तुरंत सिंचाई करें'],
    crop: 'गेहूं', stage: 'vegetative', date: 'आज'
  },
  {
    id: 3, emoji: '⚠️', type: 'pest_warning', priority: 'urgent',
    title: 'पीला रतुआ चेतावनी',
    message: 'आपके जिले में Yellow Rust (पीला रतुआ) फैल रहा है। तुरंत कार्रवाई करें।',
    actions: ['Propiconazole 25% EC 1ml/L पानी में मिलाकर छिड़कें', 'हर 10 दिन में दोहराएं', 'पड़ोसी किसानों को बताएं'],
    crop: 'गेहूं', stage: 'vegetative', date: 'कल'
  },
  {
    id: 4, emoji: '💧', type: 'irrigation', priority: 'medium',
    title: 'सिंचाई करें',
    message: 'मिट्टी की नमी कम है — फसल को पानी की जरूरत है।',
    actions: ['शाम 5 बजे के बाद सिंचाई करें', '2-3 घंटे पानी दें', 'ड्रिप सिंचाई बेहतर रहेगी'],
    crop: 'गेहूं', stage: 'vegetative', date: 'परसों'
  },
];

const PRIORITY_CONFIG = {
  urgent: { border: 'border-red-500/50',    bg: 'bg-red-500/10',    badge: 'bg-red-500/20 text-red-400 border-red-500/30',    label: '🚨 जरूरी' },
  high:   { border: 'border-amber-500/50',  bg: 'bg-amber-500/10',  badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: '⚡ महत्वपूर्ण' },
  medium: { border: 'border-blue-500/30',   bg: 'bg-blue-500/5',    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',  label: '📌 सामान्य' },
  low:    { border: 'border-gray-700',      bg: 'bg-gray-900',      badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: '📝 जानकारी' },
};

export default function Advisory() {
  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-white text-2xl font-bold mb-1">🌱 फसल सलाह</h1>
        <p className="text-gray-400 text-sm mb-6">AI-powered personalized advisory</p>
      </motion.div>

      {/* Crop health score */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-900/40 to-emerald-900/20 border 
                   border-green-500/30 rounded-3xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">फसल स्वास्थ्य स्कोर</p>
            <p className="text-white text-4xl font-black">72<span className="text-xl text-gray-400">/100</span></p>
            <p className="text-amber-400 text-sm mt-1">⚠️ 3 समस्याएं ध्यान देने योग्य</p>
          </div>
          <div className="w-20 h-20 relative">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#374151" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                strokeDasharray={`${72} ${100 - 72}`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🌾</span>
          </div>
        </div>
      </motion.div>

      {/* Advisories */}
      <div className="space-y-4">
        {ADVISORIES.map((adv, i) => {
          const cfg = PRIORITY_CONFIG[adv.priority];
          return (
            <motion.div key={adv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`border rounded-2xl p-5 ${cfg.border} ${cfg.bg}`}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{adv.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-white font-bold">{adv.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{adv.message}</p>
                </div>
              </div>

              {/* Action steps */}
              <div className="space-y-2 pl-12">
                {adv.actions.map((action, ai) => (
                  <div key={ai} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-500 font-bold mt-0.5">{ai + 1}.</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 pl-12">
                <span className="text-xs text-gray-500">{adv.crop} • {adv.date}</span>
                <button className="text-xs text-green-400 hover:text-green-300 
                                   font-medium transition-all">
                  ✓ पढ़ लिया
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}