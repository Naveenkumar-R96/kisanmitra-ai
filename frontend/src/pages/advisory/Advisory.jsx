import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ADVISORIES_DATA = {
  en: [
    { id: 1, emoji: '🌧️', priority: 'high',   title: 'Rain Expected',      message: 'Rain expected in next 24 hours. Avoid any spraying today.',          actions: ['Stop irrigation', 'Monitor crop', 'Keep drains clear'] },
    { id: 2, emoji: '🌱', priority: 'medium', title: 'Apply Urea',          message: 'Leaves are turning pale — nitrogen deficiency signs detected.',       actions: ['Apply 50kg/acre urea', 'Apply in morning or evening', 'Irrigate immediately after'] },
    { id: 3, emoji: '⚠️', priority: 'urgent', title: 'Pest Warning',        message: 'Yellow Rust (Puccinia) spreading in your district. Act now.',         actions: ['Spray Propiconazole 25% EC 1ml/L', 'Repeat every 10 days', 'Inform neighboring farmers'] },
    { id: 4, emoji: '💧', priority: 'medium', title: 'Irrigation Required', message: 'Soil moisture is low — crop needs water.',                            actions: ['Irrigate after 5 PM', 'Give water for 2-3 hours', 'Drip irrigation preferred'] },
  ],
  hi: [
    { id: 1, emoji: '🌧️', priority: 'high',   title: 'बारिश की संभावना',    message: 'अगले 24 घंटों में बारिश हो सकती है। कोई भी छिड़काव न करें।',        actions: ['सिंचाई बंद करें', 'फसल की निगरानी करें', 'नाली साफ रखें'] },
    { id: 2, emoji: '🌱', priority: 'medium', title: 'यूरिया डालें',          message: 'पत्तियां हल्की पीली हो रही हैं — नाइट्रोजन की कमी के लक्षण।',      actions: ['50 kg/एकड़ यूरिया डालें', 'सुबह या शाम डालें', 'तुरंत सिंचाई करें'] },
    { id: 3, emoji: '⚠️', priority: 'urgent', title: 'कीट चेतावनी',          message: 'आपके जिले में पीला रतुआ रोग फैल रहा है। तुरंत कार्रवाई करें।',     actions: ['Propiconazole 25% EC 1ml/L छिड़कें', 'हर 10 दिन में दोहराएं', 'पड़ोसी किसानों को बताएं'] },
    { id: 4, emoji: '💧', priority: 'medium', title: 'सिंचाई करें',           message: 'मिट्टी की नमी कम है — फसल को पानी की जरूरत है।',                   actions: ['शाम 5 बजे के बाद सिंचाई करें', '2-3 घंटे पानी दें', 'ड्रिप सिंचाई बेहतर रहेगी'] },
  ],
  pa: [
    { id: 1, emoji: '🌧️', priority: 'high',   title: 'ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ',      message: 'ਅਗਲੇ 24 ਘੰਟਿਆਂ ਵਿੱਚ ਮੀਂਹ ਪੈ ਸਕਦਾ ਹੈ। ਕੋਈ ਛਿੜਕਾਅ ਨਾ ਕਰੋ।',       actions: ['ਸਿੰਚਾਈ ਬੰਦ ਕਰੋ', 'ਫ਼ਸਲ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ', 'ਨਾਲੀ ਸਾਫ਼ ਰੱਖੋ'] },
    { id: 2, emoji: '🌱', priority: 'medium', title: 'ਯੂਰੀਆ ਪਾਓ',             message: 'ਪੱਤੇ ਪੀਲੇ ਹੋ ਰਹੇ ਹਨ — ਨਾਈਟ੍ਰੋਜਨ ਦੀ ਕਮੀ।',                       actions: ['50 kg/ਏਕੜ ਯੂਰੀਆ ਪਾਓ', 'ਸਵੇਰੇ ਜਾਂ ਸ਼ਾਮ ਪਾਓ', 'ਤੁਰੰਤ ਸਿੰਚਾਈ ਕਰੋ'] },
    { id: 3, emoji: '⚠️', priority: 'urgent', title: 'ਕੀੜੇ ਚੇਤਾਵਨੀ',          message: 'ਤੁਹਾਡੇ ਜ਼ਿਲ੍ਹੇ ਵਿੱਚ ਪੀਲਾ ਰਤੂਆ ਫੈਲ ਰਿਹਾ ਹੈ।',                      actions: ['Propiconazole ਛਿੜਕੋ', 'ਹਰ 10 ਦਿਨ ਦੁਹਰਾਓ', 'ਗੁਆਂਢੀ ਕਿਸਾਨਾਂ ਨੂੰ ਦੱਸੋ'] },
    { id: 4, emoji: '💧', priority: 'medium', title: 'ਸਿੰਚਾਈ ਕਰੋ',             message: 'ਮਿੱਟੀ ਵਿੱਚ ਨਮੀ ਘੱਟ ਹੈ — ਫ਼ਸਲ ਨੂੰ ਪਾਣੀ ਦੀ ਲੋੜ ਹੈ।',                actions: ['ਸ਼ਾਮ 5 ਵਜੇ ਬਾਅਦ ਸਿੰਚਾਈ ਕਰੋ', '2-3 ਘੰਟੇ ਪਾਣੀ ਦਿਓ', 'ਡ੍ਰਿੱਪ ਸਿੰਚਾਈ ਬਿਹਤਰ ਹੈ'] },
  ],
  ta: [
    { id: 1, emoji: '🌧️', priority: 'high',   title: 'மழை எதிர்பார்க்கப்படுகிறது', message: 'அடுத்த 24 மணி நேரத்தில் மழை வரலாம். பூச்சி மருந்து தெளிக்க வேண்டாம்.', actions: ['நீர்ப்பாசனம் நிறுத்துங்கள்', 'பயிரை கண்காணியுங்கள்', 'கால்வாய் சுத்தமாக வைக்கவும்'] },
    { id: 2, emoji: '🌱', priority: 'medium', title: 'யூரியா இடுங்கள்',             message: 'இலைகள் வெளிர் மஞ்சளாக மாறுகின்றன — நைட்ரஜன் குறைபாடு.',                 actions: ['50 kg/ஏக்கர் யூரியா இடுங்கள்', 'காலை அல்லது மாலை இடுங்கள்', 'உடனே நீர்ப்பாசனம் செய்யுங்கள்'] },
    { id: 3, emoji: '⚠️', priority: 'urgent', title: 'பூச்சி எச்சரிக்கை',            message: 'உங்கள் மாவட்டத்தில் மஞ்சள் துரு பரவுகிறது.',                              actions: ['Propiconazole தெளியுங்கள்', '10 நாட்களுக்கு ஒருமுறை', 'அண்டை விவசாயிகளுக்கு தெரிவியுங்கள்'] },
    { id: 4, emoji: '💧', priority: 'medium', title: 'நீர்ப்பாசனம் செய்யுங்கள்',    message: 'மண்ணில் ஈரம் குறைவாக உள்ளது — பயிருக்கு தண்ணீர் தேவை.',               actions: ['மாலை 5 மணிக்கு பின் நீர் பாய்ச்சுங்கள்', '2-3 மணி நேரம் நீர் விடுங்கள்', 'சொட்டு நீர்ப்பாசனம் சிறந்தது'] },
  ],
  te: [
    { id: 1, emoji: '🌧️', priority: 'high',   title: 'వర్షం ఆశించబడుతోంది',    message: 'వచ్చే 24 గంటల్లో వర్షం పడవచ్చు. పురుగుమందు చల్లవద్దు.',              actions: ['నీటిపారుదల ఆపండి', 'పంటను పర్యవేక్షించండి', 'కాలువలు శుభ్రంగా ఉంచండి'] },
    { id: 2, emoji: '🌱', priority: 'medium', title: 'యూరియా వేయండి',           message: 'ఆకులు పాలిపోతున్నాయి — నత్రజని లోపం.',                               actions: ['50 kg/ఎకరా యూరియా వేయండి', 'ఉదయం లేదా సాయంత్రం వేయండి', 'వెంటనే నీరు పెట్టండి'] },
    { id: 3, emoji: '⚠️', priority: 'urgent', title: 'చీడ హెచ్చరిక',            message: 'మీ జిల్లాలో పసుపు తుప్పు వ్యాపిస్తోంది.',                              actions: ['Propiconazole చల్లండి', '10 రోజులకోసారి చల్లండి', 'పొరుగు రైతులకు చెప్పండి'] },
    { id: 4, emoji: '💧', priority: 'medium', title: 'నీటిపారుదల చేయండి',       message: 'నేలలో తేమ తక్కువగా ఉంది — పంటకు నీరు అవసరం.',                        actions: ['సాయంత్రం 5 తర్వాత నీరు పెట్టండి', '2-3 గంటలు నీరు ఇవ్వండి', 'డ్రిప్ ఇరిగేషన్ మంచిది'] },
  ],
  mr: [
    { id: 1, emoji: '🌧️', priority: 'high',   title: 'पाऊस अपेक्षित',          message: 'पुढील 24 तासांत पाऊस येण्याची शक्यता. फवारणी करू नका.',               actions: ['सिंचन थांबवा', 'पिकाचे निरीक्षण करा', 'नाल्या स्वच्छ ठेवा'] },
    { id: 2, emoji: '🌱', priority: 'medium', title: 'युरिया टाका',              message: 'पाने फिकट पडत आहेत — नायट्रोजनची कमतरता.',                           actions: ['50 kg/एकर युरिया टाका', 'सकाळी किंवा संध्याकाळी टाका', 'लगेच पाणी द्या'] },
    { id: 3, emoji: '⚠️', priority: 'urgent', title: 'कीड चेतावनी',             message: 'तुमच्या जिल्ह्यात पिवळा गंज पसरत आहे.',                              actions: ['Propiconazole फवारा', 'दर 10 दिवसांनी परत करा', 'शेजारच्या शेतकऱ्यांना सांगा'] },
    { id: 4, emoji: '💧', priority: 'medium', title: 'पाणी द्या',                message: 'मातीतील ओलावा कमी आहे — पिकाला पाणी हवे.',                           actions: ['संध्याकाळी 5 नंतर पाणी द्या', '2-3 तास पाणी द्या', 'ठिबक सिंचन उत्तम'] },
  ],
};

export default function Advisory() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const advisories = ADVISORIES_DATA[lang] || ADVISORIES_DATA.en;

  const PRIORITY_CONFIG = {
    urgent: { border: 'border-red-500/50',   bg: 'bg-red-500/10',   badge: 'bg-red-500/20 text-red-400 border-red-500/30',     label: t('priorityUrgent') },
    high:   { border: 'border-amber-500/50', bg: 'bg-amber-500/10', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: t('priorityHigh') },
    medium: { border: 'border-blue-500/30',  bg: 'bg-blue-500/5',   badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',   label: t('priorityMedium') },
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-white text-2xl font-bold mb-1">🌱 {t('cropAdvisory')}</h1>
        <p className="text-gray-400 text-sm mb-6">{t('aiPowered')}</p>
      </motion.div>

      {/* Crop health score */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-900/40 to-emerald-900/20 border border-green-500/30 rounded-3xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">{t('cropHealthScore')}</p>
            <p className="text-white text-4xl font-black">72<span className="text-xl text-gray-400">/100</span></p>
            <p className="text-amber-400 text-sm mt-1">⚠️ 3 {t('issuesFound')}</p>
          </div>
          <div className="w-20 h-20 relative">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#374151" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                strokeDasharray="72 28" strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🌾</span>
          </div>
        </div>
      </motion.div>

      {/* Advisory Cards */}
      <div className="space-y-4">
        {advisories.map((adv, i) => {
          const cfg = PRIORITY_CONFIG[adv.priority];
          return (
            <motion.div key={adv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`border rounded-2xl p-5 ${cfg.border} ${cfg.bg}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{adv.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-white font-bold">{adv.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{adv.message}</p>
                </div>
              </div>
              <div className="space-y-2 pl-12">
                {adv.actions.map((action, ai) => (
                  <div key={ai} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-500 font-bold mt-0.5">{ai + 1}.</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pl-12">
                <span className="text-xs text-gray-500">Wheat • Today</span>
                <button className="text-xs text-green-400 hover:text-green-300 font-medium transition-all">
                  {t('markRead')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}