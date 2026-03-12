// frontend/src/components/ui/VoiceAssistant.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../../hooks/useVoice';
import { useTranslation } from 'react-i18next';

// Voice commands map (multilingual)
const COMMANDS = {
  en: {
    dashboard:  ['dashboard', 'home'],
    advisory:   ['advisory', 'advice', 'suggestion'],
    pest:       ['pest', 'crop doctor', 'disease', 'scan'],
    market:     ['market', 'price', 'mandi'],
    schemes:    ['scheme', 'yojana', 'government'],
    community:  ['community', 'forum', 'question'],
    profile:    ['profile', 'account'],
  },
  hi: {
    dashboard:  ['डैशबोर्ड', 'होम', 'घर'],
    advisory:   ['सलाह', 'एडवाइजरी', 'सुझाव'],
    pest:       ['कीट', 'रोग', 'फसल डॉक्टर', 'जांच'],
    market:     ['मंडी', 'भाव', 'मार्केट', 'कीमत'],
    schemes:    ['योजना', 'स्कीम', 'सरकारी'],
    community:  ['समुदाय', 'सवाल', 'फोरम'],
    profile:    ['प्रोफाइल', 'खाता'],
  },
  pa: {
    dashboard:  ['ਡੈਸ਼ਬੋਰਡ', 'ਘਰ'],
    advisory:   ['ਸਲਾਹ', 'ਐਡਵਾਈਜ਼ਰੀ'],
    pest:       ['ਕੀੜੇ', 'ਰੋਗ', 'ਫ਼ਸਲ ਡਾਕਟਰ'],
    market:     ['ਮੰਡੀ', 'ਭਾਅ', 'ਕੀਮਤ'],
    schemes:    ['ਯੋਜਨਾ', 'ਸਕੀਮ'],
    community:  ['ਭਾਈਚਾਰਾ', 'ਸਵਾਲ'],
    profile:    ['ਪ੍ਰੋਫਾਈਲ'],
  },
  ta: {
    dashboard:  ['டாஷ்போர்டு', 'வீடு'],
    advisory:   ['ஆலோசனை'],
    pest:       ['பூச்சி', 'நோய்', 'பயிர் மருத்துவர்'],
    market:     ['சந்தை', 'விலை'],
    schemes:    ['திட்டம்', 'யோஜனா'],
    community:  ['சமூகம்', 'கேள்வி'],
    profile:    ['சுயவிவரம்'],
  },
  te: {
    dashboard:  ['డాష్‌బోర్డ్', 'హోమ్'],
    advisory:   ['సలహా'],
    pest:       ['చీడ', 'వ్యాధి', 'పంట వైద్యుడు'],
    market:     ['మార్కెట్', 'ధర'],
    schemes:    ['పథకం', 'యోజన'],
    community:  ['సమాజం', 'ప్రశ్న'],
    profile:    ['ప్రొఫైల్'],
  },
  mr: {
    dashboard:  ['डॅशबोर्ड', 'घर'],
    advisory:   ['सल्ला'],
    pest:       ['कीड', 'रोग', 'पीक डॉक्टर'],
    market:     ['बाजार', 'भाव'],
    schemes:    ['योजना'],
    community:  ['समुदाय', 'प्रश्न'],
    profile:    ['प्रोफाइल'],
  },
};

const LANG_CODE_MAP = {
  en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN',
  ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN',
};

const RESPONSES = {
  en: { nav: 'Opening', noCmd: 'Sorry, I did not understand. Try saying Dashboard, Market or Pest.', greeting: 'Hello! How can I help you?' },
  hi: { nav: 'खोल रहे हैं', noCmd: 'माफ करें, समझ नहीं आया। डैशबोर्ड, मंडी या कीट कहें।', greeting: 'नमस्ते! मैं आपकी कैसे मदद करूं?' },
  pa: { nav: 'ਖੋਲ੍ਹ ਰਹੇ ਹਾਂ', noCmd: 'ਮਾਫ਼ ਕਰਨਾ, ਸਮਝ ਨਹੀਂ ਆਇਆ।', greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਵੇਂ ਮਦਦ ਕਰਾਂ?' },
  ta: { nav: 'திறக்கிறோம்', noCmd: 'மன்னிக்கவும், புரியவில்லை.', greeting: 'வணக்கம்! நான் எப்படி உதவலாம்?' },
  te: { nav: 'తెరుస్తున్నాం', noCmd: 'క్షమించండి, అర్థం కాలేదు.', greeting: 'నమస్కారం! నేను ఎలా సహాయం చేయాలి?' },
  mr: { nav: 'उघडत आहोत', noCmd: 'माफ करा, समजले नाही.', greeting: 'नमस्कार! मी कशी मदत करू?' },
};

export default function VoiceAssistant() {
  const [open,         setOpen]        = useState(false);
  const [feedback,     setFeedback]    = useState('');
  const [pulseRings,   setPulseRings]  = useState(false);
  const navigate  = useNavigate();
  const { i18n }  = useTranslation();
  const lang      = i18n.language || 'en';
  const speechLang = LANG_CODE_MAP[lang] || 'hi-IN';

  const handleVoiceResult = (text) => {
    const lower    = text.toLowerCase();
    const commands = COMMANDS[lang] || COMMANDS.en;
    const resp     = RESPONSES[lang] || RESPONSES.en;

    let matched = false;
    for (const [route, keywords] of Object.entries(commands)) {
      if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
        const label = kw => kw;
        setFeedback(`${resp.nav} ${route}...`);
        voice.speak(`${resp.nav} ${route}`, speechLang);
        setTimeout(() => { navigate(`/${route}`); setOpen(false); }, 1000);
        matched = true;
        break;
      }
    }

    if (!matched) {
      setFeedback(resp.noCmd);
      voice.speak(resp.noCmd, speechLang);
    }
  };

  const voice = useVoice(handleVoiceResult);

  const toggleListening = () => {
    if (voice.listening) {
      voice.stopListening();
    } else {
      setFeedback('');
      voice.startListening(speechLang);
      setPulseRings(true);
      setTimeout(() => setPulseRings(false), 5000);
    }
  };

  const openAssistant = () => {
    setOpen(true);
    const resp = RESPONSES[lang] || RESPONSES.en;
    setFeedback(resp.greeting);
    setTimeout(() => voice.speak(resp.greeting, speechLang), 300);
  };

  if (!voice.supported) return null;

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={openAssistant}
        className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-50
                   w-14 h-14 bg-green-600 hover:bg-green-500 rounded-full
                   shadow-2xl shadow-green-900/50 flex items-center justify-center
                   transition-all active:scale-90"
      >
        <span className="text-2xl">🎙️</span>
      </motion.button>

      {/* Assistant panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:bottom-8 lg:left-auto lg:right-8 lg:w-80"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-t-3xl lg:rounded-3xl
                            shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-xl">🤖</div>
                  <div>
                    <p className="text-white font-bold text-sm">KisanMitra Voice</p>
                    <p className="text-green-400 text-xs capitalize">{lang} • {speechLang}</p>
                  </div>
                </div>
                <button onClick={() => { setOpen(false); voice.cancelSpeak(); }}
                  className="text-gray-400 hover:text-white text-xl transition-colors">✕</button>
              </div>

              {/* Body */}
              <div className="p-6 text-center">
                {/* Mic visualizer */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  {voice.listening && (
                    <>
                      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-green-500/30 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        className="absolute inset-0 bg-green-500/20 rounded-full" />
                    </>
                  )}
                  <button
                    onClick={toggleListening}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center
                                text-4xl transition-all active:scale-90 shadow-lg
                                ${voice.listening
                                  ? 'bg-red-600 hover:bg-red-500 shadow-red-900/50'
                                  : 'bg-green-600 hover:bg-green-500 shadow-green-900/50'}`}
                  >
                    {voice.listening ? '⏹️' : '🎙️'}
                  </button>
                </div>

                {/* Status */}
                <p className={`text-sm font-medium mb-3 ${voice.listening ? 'text-green-400' : 'text-gray-400'}`}>
                  {voice.listening ? '🔴 Listening...' : 'Tap mic to speak'}
                </p>

                {/* Transcript */}
                {voice.transcript && (
                  <div className="bg-gray-800 rounded-xl px-4 py-2 mb-3">
                    <p className="text-white text-sm">"{voice.transcript}"</p>
                  </div>
                )}

                {/* AI Feedback */}
                {feedback && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-green-900/30 border border-green-500/30 rounded-xl px-4 py-2 mb-4">
                    <p className="text-green-300 text-sm">{feedback}</p>
                  </motion.div>
                )}

                {/* Command hints */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {Object.entries(COMMANDS[lang] || COMMANDS.en).slice(0, 6).map(([route, kws]) => (
                    <button key={route}
                      onClick={() => { navigate(`/${route}`); setOpen(false); }}
                      className="bg-gray-800 hover:bg-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:text-white transition-all capitalize">
                      {kws[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}