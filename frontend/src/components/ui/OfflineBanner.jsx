// frontend/src/components/ui/OfflineBanner.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useOffline } from '../../hooks/useOffline';
import { useTranslation } from 'react-i18next';

export default function OfflineBanner() {
  const { isOffline, wasOffline } = useOffline();
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  const MESSAGES = {
    offline: {
      en: '📵 No internet connection — showing cached data',
      hi: '📵 इंटरनेट नहीं है — सहेजा हुआ डेटा दिखा रहे हैं',
      pa: '📵 ਇੰਟਰਨੈੱਟ ਨਹੀਂ — ਸੁਰੱਖਿਅਤ ਡੇਟਾ ਦਿਖਾ ਰਹੇ ਹਾਂ',
      ta: '📵 இணைய இணைப்பு இல்லை — சேமித்த தரவு காட்டுகிறோம்',
      te: '📵 ఇంటర్నెట్ లేదు — కాష్ డేటా చూపిస్తున్నాం',
      mr: '📵 इंटरनेट नाही — जतन केलेला डेटा दाखवत आहोत',
    },
    back: {
      en: '✅ Back online! Syncing data...',
      hi: '✅ इंटरनेट वापस आ गया! डेटा sync हो रहा है...',
      pa: '✅ ਇੰਟਰਨੈੱਟ ਵਾਪਸ ਆ ਗਿਆ! ਡੇਟਾ ਸਿੰਕ ਹੋ ਰਿਹਾ ਹੈ...',
      ta: '✅ மீண்டும் ஆன்லைன்! தரவு ஒத்திசைக்கிறோம்...',
      te: '✅ తిరిగి ఆన్‌లైన్! డేటా సమకాలీకరిస్తున్నాం...',
      mr: '✅ इंटरनेट परत आले! डेटा sync होत आहे...',
    },
  };

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100]
                     bg-red-900/90 backdrop-blur border-b border-red-700
                     px-4 py-3 text-center text-red-200 text-sm font-medium"
        >
          {MESSAGES.offline[lang] || MESSAGES.offline.en}
        </motion.div>
      )}
      {!isOffline && wasOffline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[100]
                     bg-green-900/90 backdrop-blur border-b border-green-700
                     px-4 py-3 text-center text-green-200 text-sm font-medium"
        >
          {MESSAGES.back[lang] || MESSAGES.back.en}
        </motion.div>
      )}
    </AnimatePresence>
  );
}