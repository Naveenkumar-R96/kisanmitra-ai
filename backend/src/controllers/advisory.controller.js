// backend/src/controllers/advisory.controller.js
import Advisory from '../models/Advisory.js';
import { getWeatherByCoords } from '../services/weather.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const LANGUAGE_NAMES = {
  en: 'English', hi: 'Hindi', pa: 'Punjabi',
  ta: 'Tamil',   te: 'Telugu', mr: 'Marathi',
};

const getFallbackAdvisories = (lang, weather) => {
  const temp     = weather?.temp     || 28;
  const humidity = weather?.humidity || 65;
  const rainfall = weather?.rainfall || 0;

  const data = {
    en: [
      {
        type: 'weather_alert',
        priority: rainfall > 5 ? 'high' : 'medium',
        title: rainfall > 5 ? 'Rain Alert — Avoid Spraying' : 'Weather Update',
        message: rainfall > 5
          ? `${rainfall}mm rain expected. Do not spray pesticides or fertilizers today. Keep field drains clear.`
          : `Temperature ${Math.round(temp)}°C, Humidity ${humidity}%. Good conditions for farming activities today.`,
        actions: [
          { step: 1, action: rainfall > 5 ? 'Stop all spraying activities' : 'Check soil moisture levels', timing: 'morning' },
          { step: 2, action: 'Monitor crop for any disease symptoms', timing: 'evening' }
        ]
      },
      {
        type: 'fertilizer',
        priority: 'medium',
        title: 'Weekly Fertilizer Check',
        message: 'Check crop leaves for yellowing which indicates nitrogen deficiency. Apply urea if pale yellow color found on lower leaves.',
        actions: [
          { step: 1, action: 'Inspect leaves for pale yellow color', timing: 'morning' },
          { step: 2, action: 'Apply 50kg per acre urea if yellowing found', timing: 'morning' }
        ]
      },
      {
        type: 'pest_warning',
        priority: humidity > 80 ? 'high' : 'low',
        title: humidity > 80 ? 'High Humidity — Fungal Risk' : 'Regular Pest Check',
        message: humidity > 80
          ? `Humidity at ${humidity}%. High risk of fungal disease. Inspect crops carefully and spray preventively.`
          : 'Regular pest monitoring recommended. Check undersides of leaves for insects and eggs.',
        actions: [
          { step: 1, action: 'Check for white powder or spots on leaves', timing: 'morning' },
          { step: 2, action: humidity > 80 ? 'Spray Mancozeb 2g per litre water' : 'Remove weeds around plants', timing: 'evening' }
        ]
      },
      {
        type: 'general',
        priority: 'low',
        title: 'Soil Health Reminder',
        message: 'Good soil health leads to better yields. Consider getting your soil tested this season for best fertilizer recommendations.',
        actions: [
          { step: 1, action: 'Visit local Krishi Vigyan Kendra for soil testing', timing: 'weekly' },
          { step: 2, action: 'Apply organic compost to improve soil structure', timing: 'weekly' }
        ]
      }
    ],
    hi: [
      {
        type: 'weather_alert',
        priority: rainfall > 5 ? 'high' : 'medium',
        title: rainfall > 5 ? 'बारिश की चेतावनी' : 'मौसम अपडेट',
        message: rainfall > 5
          ? `${rainfall}mm बारिश की संभावना है। आज कोई भी छिड़काव न करें। नाली साफ रखें।`
          : `तापमान ${Math.round(temp)}°C, नमी ${humidity}%। आज खेती के लिए अच्छा मौसम है।`,
        actions: [
          { step: 1, action: rainfall > 5 ? 'सभी छिड़काव बंद करें' : 'मिट्टी की नमी जांचें', timing: 'morning' },
          { step: 2, action: 'फसल में रोग के लक्षण देखें', timing: 'evening' }
        ]
      },
      {
        type: 'fertilizer',
        priority: 'medium',
        title: 'साप्ताहिक उर्वरक जांच',
        message: 'फसल की पत्तियां पीली हो रही हैं तो नाइट्रोजन की कमी है। जरूरत पर यूरिया डालें।',
        actions: [
          { step: 1, action: 'पत्तियों का रंग जांचें', timing: 'morning' },
          { step: 2, action: 'पीलापन हो तो 50kg प्रति एकड़ यूरिया डालें', timing: 'morning' }
        ]
      },
      {
        type: 'pest_warning',
        priority: humidity > 80 ? 'high' : 'low',
        title: humidity > 80 ? 'अधिक नमी — फफूंद का खतरा' : 'नियमित कीट जांच',
        message: humidity > 80
          ? `नमी ${humidity}% है। फफूंद रोग का खतरा है। फसल की जांच करें।`
          : 'नियमित कीट निगरानी करें। पत्तियों के नीचे देखें।',
        actions: [
          { step: 1, action: 'पत्तियों पर सफेद पाउडर देखें', timing: 'morning' },
          { step: 2, action: humidity > 80 ? 'Mancozeb 2g/L छिड़कें' : 'खरपतवार हटाएं', timing: 'evening' }
        ]
      },
      {
        type: 'general',
        priority: 'low',
        title: 'मिट्टी स्वास्थ्य',
        message: 'अच्छी मिट्टी से अच्छी उपज होती है। हर मौसम में मिट्टी परीक्षण करवाएं।',
        actions: [
          { step: 1, action: 'कृषि विज्ञान केंद्र से मिट्टी परीक्षण करवाएं', timing: 'weekly' },
          { step: 2, action: 'जैविक खाद डालें', timing: 'weekly' }
        ]
      }
    ],
    ta: [
      {
        type: 'weather_alert',
        priority: rainfall > 5 ? 'high' : 'medium',
        title: rainfall > 5 ? 'மழை எச்சரிக்கை' : 'வானிலை அறிவிப்பு',
        message: rainfall > 5
          ? `${rainfall}mm மழை எதிர்பார்க்கப்படுகிறது. இன்று எந்த தெளிப்பும் வேண்டாம்.`
          : `வெப்பநிலை ${Math.round(temp)}°C, ஈரப்பதம் ${humidity}%. இன்று விவசாயத்திற்கு நல்ல நேரம்.`,
        actions: [
          { step: 1, action: rainfall > 5 ? 'அனைத்து தெளிப்பையும் நிறுத்துங்கள்' : 'மண் ஈரப்பதம் சரிபார்க்கவும்', timing: 'morning' },
          { step: 2, action: 'பயிரில் நோய் அறிகுறிகளை கண்காணியுங்கள்', timing: 'evening' }
        ]
      },
      {
        type: 'fertilizer',
        priority: 'medium',
        title: 'வாராந்திர உர சோதனை',
        message: 'இலைகள் மஞ்சளாக மாறினால் நைட்ரஜன் குறைபாடு உள்ளது. தேவைப்பட்டால் யூரியா இடுங்கள்.',
        actions: [
          { step: 1, action: 'இலை நிறத்தை சரிபார்க்கவும்', timing: 'morning' },
          { step: 2, action: 'மஞ்சளாக இருந்தால் 50kg/ஏக்கர் யூரியா இடுங்கள்', timing: 'morning' }
        ]
      },
      {
        type: 'pest_warning',
        priority: humidity > 80 ? 'high' : 'low',
        title: humidity > 80 ? 'அதிக ஈரப்பதம் — பூஞ்சை அபாயம்' : 'வழக்கமான பூச்சி சோதனை',
        message: humidity > 80
          ? `ஈரப்பதம் ${humidity}%. பூஞ்சை நோய் அபாயம் உள்ளது.`
          : 'வழக்கமான பூச்சி கண்காணிப்பு செய்யுங்கள்.',
        actions: [
          { step: 1, action: 'இலைகளில் வெள்ளை தூள் சரிபார்க்கவும்', timing: 'morning' },
          { step: 2, action: humidity > 80 ? 'Mancozeb 2g/L தெளியுங்கள்' : 'களைகளை அகற்றுங்கள்', timing: 'evening' }
        ]
      },
      {
        type: 'general',
        priority: 'low',
        title: 'மண் ஆரோக்கியம்',
        message: 'நல்ல மண் நல்ல விளைச்சலுக்கு வழிவகுக்கும். இந்த பருவத்தில் மண் பரிசோதனை செய்யுங்கள்.',
        actions: [
          { step: 1, action: 'உள்ளூர் KVK யில் மண் பரிசோதனை செய்யுங்கள்', timing: 'weekly' },
          { step: 2, action: 'மண் அமைப்பை மேம்படுத்த கம்போஸ்ட் இடுங்கள்', timing: 'weekly' }
        ]
      }
    ],
    te: [
      {
        type: 'weather_alert',
        priority: rainfall > 5 ? 'high' : 'medium',
        title: rainfall > 5 ? 'వర్షం హెచ్చరిక' : 'వాతావరణ నవీకరణ',
        message: rainfall > 5
          ? `${rainfall}mm వర్షం ఆశించబడుతోంది. నేడు పిచికారీ వద్దు.`
          : `ఉష్ణోగ్రత ${Math.round(temp)}°C, తేమ ${humidity}%. వ్యవసాయానికి మంచి రోజు.`,
        actions: [
          { step: 1, action: rainfall > 5 ? 'అన్ని పిచికారీలు ఆపండి' : 'నేల తేమ తనిఖీ చేయండి', timing: 'morning' },
          { step: 2, action: 'పంటలో వ్యాధి లక్షణాలు గమనించండి', timing: 'evening' }
        ]
      },
      {
        type: 'fertilizer',
        priority: 'medium',
        title: 'వారపు ఎరువు తనిఖీ',
        message: 'ఆకులు పాలిపోతే నత్రజని లోపం ఉంది. అవసరమైతే యూరియా వేయండి.',
        actions: [
          { step: 1, action: 'ఆకు రంగు తనిఖీ చేయండి', timing: 'morning' },
          { step: 2, action: 'పాలిపోతే 50kg/ఎకరా యూరియా వేయండి', timing: 'morning' }
        ]
      },
      {
        type: 'pest_warning',
        priority: humidity > 80 ? 'high' : 'low',
        title: humidity > 80 ? 'అధిక తేమ — శిలీంధ్ర ప్రమాదం' : 'సాధారణ చీడ తనిఖీ',
        message: humidity > 80
          ? `తేమ ${humidity}%. శిలీంధ్ర వ్యాధి ప్రమాదం ఉంది.`
          : 'సాధారణ చీడ పర్యవేక్షణ చేయండి.',
        actions: [
          { step: 1, action: 'ఆకులపై తెల్లని పొడి తనిఖీ చేయండి', timing: 'morning' },
          { step: 2, action: humidity > 80 ? 'Mancozeb 2g/L చల్లండి' : 'కలుపు మొక్కలు తీయండి', timing: 'evening' }
        ]
      },
      {
        type: 'general',
        priority: 'low',
        title: 'నేల ఆరోగ్యం',
        message: 'మంచి నేల మంచి దిగుబడికి దారితీస్తుంది. ఈ సీజన్‌లో నేల పరీక్ష చేయించుకోండి.',
        actions: [
          { step: 1, action: 'స్థానిక KVK లో నేల పరీక్ష చేయించుకోండి', timing: 'weekly' },
          { step: 2, action: 'నేల నిర్మాణం మెరుగుపరచడానికి కంపోస్ట్ వేయండి', timing: 'weekly' }
        ]
      }
    ],
    pa: [
      {
        type: 'weather_alert',
        priority: rainfall > 5 ? 'high' : 'medium',
        title: rainfall > 5 ? 'ਮੀਂਹ ਦੀ ਚੇਤਾਵਨੀ' : 'ਮੌਸਮ ਅਪਡੇਟ',
        message: rainfall > 5
          ? `${rainfall}mm ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ। ਅੱਜ ਕੋਈ ਛਿੜਕਾਅ ਨਾ ਕਰੋ।`
          : `ਤਾਪਮਾਨ ${Math.round(temp)}°C, ਨਮੀ ${humidity}%। ਅੱਜ ਖੇਤੀ ਲਈ ਚੰਗਾ ਮੌਸਮ ਹੈ।`,
        actions: [
          { step: 1, action: rainfall > 5 ? 'ਸਾਰੇ ਛਿੜਕਾਅ ਬੰਦ ਕਰੋ' : 'ਮਿੱਟੀ ਦੀ ਨਮੀ ਜਾਂਚੋ', timing: 'morning' },
          { step: 2, action: 'ਫ਼ਸਲ ਵਿੱਚ ਰੋਗ ਦੇ ਲੱਛਣ ਦੇਖੋ', timing: 'evening' }
        ]
      },
      {
        type: 'fertilizer',
        priority: 'medium',
        title: 'ਹਫ਼ਤਾਵਾਰੀ ਖਾਦ ਜਾਂਚ',
        message: 'ਪੱਤੇ ਪੀਲੇ ਹੋ ਰਹੇ ਹਨ ਤਾਂ ਨਾਈਟ੍ਰੋਜਨ ਦੀ ਕਮੀ ਹੈ। ਲੋੜ ਪਈ ਤੇ ਯੂਰੀਆ ਪਾਓ।',
        actions: [
          { step: 1, action: 'ਪੱਤਿਆਂ ਦਾ ਰੰਗ ਜਾਂਚੋ', timing: 'morning' },
          { step: 2, action: 'ਪੀਲੇ ਹੋਣ ਤੇ 50kg/ਏਕੜ ਯੂਰੀਆ ਪਾਓ', timing: 'morning' }
        ]
      },
      {
        type: 'pest_warning',
        priority: humidity > 80 ? 'high' : 'low',
        title: humidity > 80 ? 'ਵੱਧ ਨਮੀ — ਉੱਲੀ ਦਾ ਖਤਰਾ' : 'ਨਿਯਮਿਤ ਕੀੜੇ ਜਾਂਚ',
        message: humidity > 80
          ? `ਨਮੀ ${humidity}% ਹੈ। ਉੱਲੀ ਰੋਗ ਦਾ ਖਤਰਾ ਹੈ।`
          : 'ਨਿਯਮਿਤ ਕੀੜੇ ਨਿਗਰਾਨੀ ਕਰੋ।',
        actions: [
          { step: 1, action: 'ਪੱਤਿਆਂ ਤੇ ਚਿੱਟਾ ਪਾਊਡਰ ਦੇਖੋ', timing: 'morning' },
          { step: 2, action: humidity > 80 ? 'Mancozeb 2g/L ਛਿੜਕੋ' : 'ਨਦੀਨ ਹਟਾਓ', timing: 'evening' }
        ]
      },
      {
        type: 'general',
        priority: 'low',
        title: 'ਮਿੱਟੀ ਸਿਹਤ',
        message: 'ਚੰਗੀ ਮਿੱਟੀ ਨਾਲ ਵਧੀਆ ਫ਼ਸਲ ਹੁੰਦੀ ਹੈ। ਇਸ ਸੀਜ਼ਨ ਵਿੱਚ ਮਿੱਟੀ ਟੈਸਟ ਕਰਵਾਓ।',
        actions: [
          { step: 1, action: 'ਸਥਾਨਕ KVK ਤੋਂ ਮਿੱਟੀ ਟੈਸਟ ਕਰਵਾਓ', timing: 'weekly' },
          { step: 2, action: 'ਮਿੱਟੀ ਸੁਧਾਰਨ ਲਈ ਜੈਵਿਕ ਖਾਦ ਪਾਓ', timing: 'weekly' }
        ]
      }
    ],
    mr: [
      {
        type: 'weather_alert',
        priority: rainfall > 5 ? 'high' : 'medium',
        title: rainfall > 5 ? 'पाऊस चेतावनी' : 'हवामान अपडेट',
        message: rainfall > 5
          ? `${rainfall}mm पाऊस अपेक्षित आहे. आज फवारणी करू नका.`
          : `तापमान ${Math.round(temp)}°C, आर्द्रता ${humidity}%. आज शेतीसाठी चांगला दिवस.`,
        actions: [
          { step: 1, action: rainfall > 5 ? 'सर्व फवारणी थांबवा' : 'मातीतील ओलावा तपासा', timing: 'morning' },
          { step: 2, action: 'पिकात रोगाची लक्षणे पहा', timing: 'evening' }
        ]
      },
      {
        type: 'fertilizer',
        priority: 'medium',
        title: 'साप्ताहिक खत तपासणी',
        message: 'पाने पिवळी पडत असतील तर नायट्रोजनची कमतरता आहे. गरज असल्यास युरिया टाका.',
        actions: [
          { step: 1, action: 'पानांचा रंग तपासा', timing: 'morning' },
          { step: 2, action: 'पिवळी असल्यास 50kg/एकर युरिया टाका', timing: 'morning' }
        ]
      },
      {
        type: 'pest_warning',
        priority: humidity > 80 ? 'high' : 'low',
        title: humidity > 80 ? 'जास्त आर्द्रता — बुरशीचा धोका' : 'नियमित कीड तपासणी',
        message: humidity > 80
          ? `आर्द्रता ${humidity}% आहे. बुरशीजन्य रोगाचा धोका आहे.`
          : 'नियमित कीड निरीक्षण करा.',
        actions: [
          { step: 1, action: 'पानांवर पांढरी पूड तपासा', timing: 'morning' },
          { step: 2, action: humidity > 80 ? 'Mancozeb 2g/L फवारा' : 'तण काढा', timing: 'evening' }
        ]
      },
      {
        type: 'general',
        priority: 'low',
        title: 'माती आरोग्य',
        message: 'चांगली माती चांगल्या उत्पादनास कारणीभूत ठरते. या हंगामात माती परीक्षण करा.',
        actions: [
          { step: 1, action: 'स्थानिक KVK मध्ये माती परीक्षण करा', timing: 'weekly' },
          { step: 2, action: 'माती सुधारण्यासाठी कंपोस्ट टाका', timing: 'weekly' }
        ]
      }
    ],
  };

  return data[lang] || data.en;
};

// GET /api/advisory
export const getAdvisories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, isRead } = req.query;
  const query = { farmer: req.user._id };
  if (type)   query.type   = type;
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const total      = await Advisory.countDocuments(query);
  const advisories = await Advisory.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  ApiResponse.paginated(res, advisories, total, page, limit);
});

// POST /api/advisory/generate
export const generateAdvisory = asyncHandler(async (req, res) => {
  const farmer = req.user;
  const { lat, lng } = req.body;

  const lang = farmer.language || 'en';

  // Get weather
  let weather = null;
  let weatherContext = {};
  try {
    const w = await getWeatherByCoords(lat || 30.9, lng || 75.8);
    weather  = w.current;
    weatherContext = {
      temperature: w.current.temp,
      humidity:    w.current.humidity,
      rainfall:    w.current.rainfall,
      condition:   w.current.condition,
    };
  } catch (e) {
    console.log('Weather fetch failed:', e.message);
  }

  // Get fallback advisories in user's language
  const advisoryData = getFallbackAdvisories(lang, weather);

  // Save to MongoDB
  const toSave = advisoryData.map(adv => ({
    farmer:   farmer._id,
    type:     adv.type     || 'general',
    priority: adv.priority || 'medium',
    title:    adv.title,
    message:  adv.message,
    actions:  adv.actions  || [],
    weatherContext,
    cropStage: 'vegetative',
    language:  lang,
  }));

  console.log(`Saving ${toSave.length} advisories for farmer ${farmer._id}`);
  const saved = await Advisory.insertMany(toSave);
  console.log(`✅ Saved ${saved.length} advisories`);

  ApiResponse.success(res, saved, `${saved.length} AI advisories generated`, 201);
});

// PATCH /api/advisory/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  await Advisory.findOneAndUpdate(
    { _id: req.params.id, farmer: req.user._id },
    { isRead: true }
  );
  ApiResponse.success(res, null, 'Marked as read');
});