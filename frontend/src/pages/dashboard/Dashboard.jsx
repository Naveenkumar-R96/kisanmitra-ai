import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authSlice';
import { weatherApi } from '../../api/weather.api';
import { schemesApi } from '../../api/schemes.api';
import { advisoryApi } from '../../api/advisory.api';
import StatCard from '../../components/ui/StatCard';
import toast from 'react-hot-toast';

const DUMMY_ADVISORIES = [
  { id: 1, emoji: '🌧️', priority: 'high',   titleKey: 'adv1Title', msgKey: 'adv1Msg' },
  { id: 2, emoji: '🌱', priority: 'medium', titleKey: 'adv2Title', msgKey: 'adv2Msg' },
  { id: 3, emoji: '⚠️', priority: 'urgent', titleKey: 'adv3Title', msgKey: 'adv3Msg' },
];

export default function Dashboard() {
  const { user }    = useAuthStore();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  // This forces re-render when language changes
  const [, setLang] = useState(i18n.language);
  useEffect(() => {
    const handleLangChange = (lng) => setLang(lng);
    i18n.on('languageChanged', handleLangChange);
    return () => i18n.off('languageChanged', handleLangChange);
  }, [i18n]);

  const { data: weatherData } = useQuery({
    queryKey: ['weather'],
    queryFn:  () => weatherApi.get(
      user?.location?.coordinates?.lat || 30.9,
      user?.location?.coordinates?.lng || 75.8
    ),
    staleTime: 30 * 60 * 1000,
    enabled: !!user,
  });

  const { data: schemesData } = useQuery({
    queryKey: ['schemes-matched'],
    queryFn:  () => schemesApi.getMatched(),
    enabled:  !!user,
  });

  const generateMutation = useMutation({
    mutationFn: () => advisoryApi.generate({
      lat: user?.location?.coordinates?.lat || 30.9,
      lng: user?.location?.coordinates?.lng || 75.8,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisories'] });
      toast.success(t('newAdvisoryReady'));
    },
    onError: () => {
      toast.error('Failed to generate advisory. Try again.');
    }
  });

  const w       = weatherData?.data?.current;
  const schemes = schemesData?.data || [];
  const hour    = new Date().getHours();

  const greeting =
    hour < 12 ? t('goodMorning') :
    hour < 17 ? t('goodAfternoon') :
    t('goodEvening');

  const QUICK_ACTIONS = [
    { to: '/pest',      emoji: '🔬', labelKey: 'cropDoctor', color: 'bg-red-500/20    border-red-500/30    text-red-400'    },
    { to: '/market',    emoji: '📈', labelKey: 'market',     color: 'bg-blue-500/20   border-blue-500/30   text-blue-400'   },
    { to: '/schemes',   emoji: '📋', labelKey: 'schemes',    color: 'bg-purple-500/20 border-purple-500/30 text-purple-400' },
    { to: '/community', emoji: '👥', labelKey: 'community',  color: 'bg-amber-500/20  border-amber-500/30  text-amber-400'  },
  ];

  const PRIORITY_CONFIG = {
    urgent: { border: 'border-red-500/50',   badge: 'bg-red-500/20   text-red-400   border-red-500/30',   label: t('priorityUrgent') },
    high:   { border: 'border-amber-500/50', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: t('priorityHigh')   },
    medium: { border: 'border-blue-500/30',  badge: 'bg-blue-500/20  text-blue-400  border-blue-500/30',  label: t('priorityMedium') },
  };

  const weatherIcon =
    w?.condition === 'Rain'   ? '🌧️' :
    w?.condition === 'Clouds' ? '☁️'  :
    w?.condition === 'Clear'  ? '☀️'  : '🌤️';

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{greeting} 👋</p>
            <h1 className="text-white text-2xl font-bold">{user?.name}</h1>
            <p className="text-green-400 text-sm">📍 {user?.location?.village}, {user?.location?.state}</p>
          </div>
          {w && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3 text-right">
              <p className="text-3xl">{weatherIcon}</p>
              <p className="text-white font-bold text-lg">{Math.round(w.temp)}°C</p>
              <p className="text-gray-400 text-xs">{w.humidity}% {t('humidity')}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon="🌾" label={t('land')}             value={`${user?.farmDetails?.landSize || 0} ${t('acres')}`} color="green" delay={0.1} />
        <StatCard icon="🌡️" label={t('temperature')}      value={w ? `${Math.round(w.temp)}°C` : '--'}               color="amber" delay={0.2} />
        <StatCard icon="💧" label={t('humidity')}          value={w ? `${w.humidity}%` : '--'}                        color="blue"  delay={0.3} />
        <StatCard icon="📋" label={t('schemesAvailable')}  value={schemes.length || 0}                                color="green" delay={0.4} />
      </div>

      {/* Generate Advisory Button */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        onClick={() => generateMutation.mutate()}
        disabled={generateMutation.isPending}
        className="w-full bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 disabled:from-green-900 disabled:to-emerald-900 text-white font-bold py-4 rounded-2xl mb-6 transition-all active:scale-95 shadow-lg shadow-green-900/30"
      >
        {generateMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('generatingAI')}
          </span>
        ) : t('getAIAdvisory')}
      </motion.button>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-6">
        <h2 className="text-white font-bold text-lg mb-3">{t('quickActions')}</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ to, emoji, labelKey, color }) => (
            <Link key={to} to={to}
              className={`border rounded-2xl p-4 text-center transition-all hover:scale-105 active:scale-95 ${color}`}>
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="text-xs font-semibold">{t(labelKey)}</div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Weather Advice */}
      {weatherData?.data?.farmingAdvice?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6">
          <h2 className="text-white font-bold text-lg mb-3">🌤️ {t('weatherAdvice')}</h2>
          <div className="space-y-2">
            {weatherData.data.farmingAdvice.map((advice, i) => (
              <div key={i} className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-blue-300 text-sm">
                {advice}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Today's Advisories */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg">📢 {t('todayAdvisory')}</h2>
          <Link to="/advisory" className="text-green-400 text-sm hover:text-green-300">{t('viewAll')}</Link>
        </div>
        <div className="space-y-3">
          {DUMMY_ADVISORIES.map((adv, i) => {
            const cfg = PRIORITY_CONFIG[adv.priority] || PRIORITY_CONFIG.medium;
            return (
              <motion.div
                key={adv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`bg-gray-900 border rounded-2xl p-4 flex gap-4 items-start ${cfg.border}`}
              >
                <span className="text-3xl">{adv.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-white font-semibold text-sm">{t(adv.titleKey)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{t(adv.msgKey)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}