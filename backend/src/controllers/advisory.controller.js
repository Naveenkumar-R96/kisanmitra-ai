// backend/src/controllers/advisory.controller.js
import Advisory from '../models/Advisory.js';
import { getWeatherByCoords } from '../services/weather.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import axios from 'axios';

const LANGUAGE_NAMES = {
  en: 'English', hi: 'Hindi', pa: 'Punjabi',
  ta: 'Tamil',   te: 'Telugu', mr: 'Marathi',
};

const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 6  && month <= 10) return 'Kharif (June-October)';
  if (month >= 11 || month <= 3)  return 'Rabi (November-March)';
  return 'Zaid (April-May)';
};

const callGemini = async (prompt) => {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) throw new Error('No Gemini key');

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { timeout: 20000 }
  );

  const text = response.data.candidates[0].content.parts[0].text;
  return text.replace(/```json|```/g, '').trim();
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
  const farmer   = req.user;
  const { lat, lng } = req.body;
  const lang     = farmer.language || 'en';
  const langName = LANGUAGE_NAMES[lang] || 'English';
  const season   = getCurrentSeason();

  // Get real weather
  let weather = null;
  let weatherText = 'Weather data unavailable';
  let weatherContext = {};

  try {
    const w    = await getWeatherByCoords(
      lat || farmer.location?.coordinates?.lat || 20.5,
      lng || farmer.location?.coordinates?.lng || 78.9
    );
    weather    = w.current;
    weatherText = `Temperature: ${Math.round(w.current.temp)}°C, Humidity: ${w.current.humidity}%, Condition: ${w.current.condition}, Rainfall: ${w.current.rainfall}mm`;
    weatherContext = {
      temperature: w.current.temp,
      humidity:    w.current.humidity,
      rainfall:    w.current.rainfall,
      condition:   w.current.condition,
    };
  } catch (e) {
    console.log('Weather fetch failed:', e.message);
  }

  // Build rich prompt for Gemini
  const prompt = `You are KisanMitra AI, an expert agricultural advisor for Indian farmers with 20+ years experience.

FARMER PROFILE:
- Name: ${farmer.name}
- Location: ${farmer.location?.village || 'N/A'}, ${farmer.location?.district || 'N/A'}, ${farmer.location?.state || 'N/A'}
- Land Size: ${farmer.farmDetails?.landSize || 1} acres
- Soil Type: ${farmer.farmDetails?.soilType || 'loamy'}
- Irrigation: ${farmer.farmDetails?.irrigationType || 'rainfed'}

CURRENT CONDITIONS:
- Weather: ${weatherText}
- Season: ${season}
- Date: ${new Date().toLocaleDateString('en-IN')}

Generate 4 highly specific, actionable farm advisories for this farmer in ${langName} language.
Base the advice on the ACTUAL weather conditions and farmer's specific profile.

Respond ONLY with a valid JSON array, no other text:
[
  {
    "type": "weather_alert",
    "priority": "high",
    "title": "specific title in ${langName}",
    "message": "2-3 sentence specific advice based on actual weather in ${langName}",
    "actions": [
      { "step": 1, "action": "specific action in ${langName}", "timing": "morning" },
      { "step": 2, "action": "specific action in ${langName}", "timing": "evening" }
    ]
  }
]

Types to use: weather_alert, pest_warning, fertilizer, irrigation, harvest, general
Priorities: urgent, high, medium, low
Timings: morning, evening, immediately, weekly

Rules:
- If rainfall > 5mm: include weather_alert with high priority
- If humidity > 80%: include pest_warning for fungal diseases  
- If temp > 35°C: include irrigation advisory
- Always include fertilizer and general advisory
- Be very specific — mention actual temperature, humidity values
- Give precise chemical/organic treatment names with dosage
- Use simple language farmers understand in ${langName}`;

  let advisoryData = [];

  try {
    const text   = await callGemini(prompt);
    advisoryData = JSON.parse(text);
    console.log(`✅ Gemini generated ${advisoryData.length} advisories for ${farmer.name} in ${langName}`);
  } catch (err) {
    console.log('Gemini advisory failed:', err.message);

    // Smart weather-based fallback
    const temp     = weatherContext.temperature || 28;
    const humidity = weatherContext.humidity    || 65;
    const rainfall = weatherContext.rainfall    || 0;

    const FALLBACK = {
      en: [
        {
          type: 'weather_alert',
          priority: rainfall > 5 ? 'high' : 'medium',
          title:   rainfall > 5 ? 'Heavy Rain Alert' : `Weather Update: ${Math.round(temp)}°C`,
          message: rainfall > 5
            ? `${rainfall}mm rainfall expected. Avoid spraying pesticides or fertilizers today. Ensure field drains are clear to prevent waterlogging.`
            : `Temperature is ${Math.round(temp)}°C with ${humidity}% humidity. ${temp > 35 ? 'Irrigate in early morning or evening to avoid heat stress.' : 'Good conditions for farm work today.'}`,
          actions: [
            { step: 1, action: rainfall > 5 ? 'Clear all field drainage channels' : 'Check soil moisture levels', timing: 'morning' },
            { step: 2, action: 'Monitor crops for disease or pest signs', timing: 'evening' }
          ]
        },
        {
          type: 'fertilizer',
          priority: 'medium',
          title: 'Weekly Nitrogen Check',
          message: `Check your ${farmer.farmDetails?.soilType || 'loamy'} soil crops for pale yellow leaves indicating nitrogen deficiency. Current ${season} season requires adequate nutrition.`,
          actions: [
            { step: 1, action: 'Inspect lower leaves for yellowing signs', timing: 'morning' },
            { step: 2, action: 'Apply 50kg per acre Urea if yellowing found', timing: 'morning' }
          ]
        },
        {
          type: humidity > 80 ? 'pest_warning' : 'general',
          priority: humidity > 80 ? 'high' : 'low',
          title: humidity > 80 ? `Fungal Disease Risk — ${humidity}% Humidity` : 'Regular Crop Monitoring',
          message: humidity > 80
            ? `High humidity of ${humidity}% creates ideal conditions for fungal diseases like blight and mildew. Inspect crops immediately and spray preventively.`
            : 'Regular field monitoring is essential during this season. Check for any unusual leaf discoloration, wilting or pest damage.',
          actions: [
            { step: 1, action: humidity > 80 ? 'Spray Mancozeb 75% WP @ 2g per litre water' : 'Walk through field and inspect all plants', timing: 'morning' },
            { step: 2, action: humidity > 80 ? 'Repeat spray after 7 days if humidity stays high' : 'Note any problem areas for treatment', timing: 'weekly' }
          ]
        },
        {
          type: 'irrigation',
          priority: temp > 35 ? 'high' : 'low',
          title: temp > 35 ? `Urgent Irrigation — ${Math.round(temp)}°C Heat Stress` : 'Irrigation Schedule',
          message: temp > 35
            ? `Temperature at ${Math.round(temp)}°C is causing heat stress. Your ${farmer.farmDetails?.landSize || 1} acre farm needs immediate irrigation to prevent crop damage.`
            : `Maintain regular irrigation schedule for your ${farmer.farmDetails?.irrigationType || 'rainfed'} system. Check soil moisture before irrigating.`,
          actions: [
            { step: 1, action: temp > 35 ? 'Irrigate immediately — early morning preferred' : 'Check soil moisture by pressing soil', timing: temp > 35 ? 'immediately' : 'morning' },
            { step: 2, action: 'Apply mulching to retain soil moisture', timing: 'morning' }
          ]
        }
      ],
      hi: [
        {
          type: 'weather_alert',
          priority: rainfall > 5 ? 'high' : 'medium',
          title:   rainfall > 5 ? 'भारी बारिश की चेतावनी' : `मौसम अपडेट: ${Math.round(temp)}°C`,
          message: rainfall > 5
            ? `${rainfall}mm बारिश होने की संभावना है। आज कोई भी छिड़काव न करें। जलभराव से बचने के लिए नालियां साफ रखें।`
            : `तापमान ${Math.round(temp)}°C है, नमी ${humidity}%। ${temp > 35 ? 'गर्मी से बचाने के लिए सुबह या शाम सिंचाई करें।' : 'आज खेती के काम के लिए अच्छा मौसम है।'}`,
          actions: [
            { step: 1, action: rainfall > 5 ? 'खेत की सभी नालियां साफ करें' : 'मिट्टी की नमी जांचें', timing: 'morning' },
            { step: 2, action: 'फसल में रोग या कीट के लक्षण देखें', timing: 'evening' }
          ]
        },
        {
          type: 'fertilizer',
          priority: 'medium',
          title: 'साप्ताहिक नाइट्रोजन जांच',
          message: `अपनी फसल की पत्तियों में पीलापन देखें जो नाइट्रोजन की कमी का संकेत है। ${season} में पर्याप्त पोषण जरूरी है।`,
          actions: [
            { step: 1, action: 'नीचे की पत्तियों में पीलापन देखें', timing: 'morning' },
            { step: 2, action: 'पीलापन हो तो 50kg/एकड़ यूरिया डालें', timing: 'morning' }
          ]
        },
        {
          type: humidity > 80 ? 'pest_warning' : 'general',
          priority: humidity > 80 ? 'high' : 'low',
          title: humidity > 80 ? `फफूंद रोग का खतरा — ${humidity}% नमी` : 'नियमित फसल निगरानी',
          message: humidity > 80
            ? `${humidity}% अधिक नमी से फफूंद रोग का खतरा है। तुरंत फसल की जांच करें और रोकथाम के लिए छिड़काव करें।`
            : 'इस मौसम में नियमित खेत निरीक्षण जरूरी है। पत्तियों के रंग, मुरझाने या कीड़ों की जांच करें।',
          actions: [
            { step: 1, action: humidity > 80 ? 'Mancozeb 75% WP @ 2g/L पानी में मिलाकर छिड़कें' : 'खेत में घूमकर सभी पौधों की जांच करें', timing: 'morning' },
            { step: 2, action: humidity > 80 ? '7 दिन बाद दोबारा छिड़काव करें' : 'समस्या वाली जगह नोट करें', timing: 'weekly' }
          ]
        },
        {
          type: 'irrigation',
          priority: temp > 35 ? 'high' : 'low',
          title: temp > 35 ? `तुरंत सिंचाई करें — ${Math.round(temp)}°C गर्मी` : 'सिंचाई कार्यक्रम',
          message: temp > 35
            ? `${Math.round(temp)}°C तापमान से फसल को नुकसान हो सकता है। आपके ${farmer.farmDetails?.landSize || 1} एकड़ खेत में तुरंत सिंचाई करें।`
            : `अपने ${farmer.farmDetails?.irrigationType || 'वर्षाधारित'} सिंचाई के नियमित कार्यक्रम का पालन करें।`,
          actions: [
            { step: 1, action: temp > 35 ? 'तुरंत सिंचाई करें — सुबह जल्दी' : 'मिट्टी में नमी जांचें', timing: temp > 35 ? 'immediately' : 'morning' },
            { step: 2, action: 'नमी बनाए रखने के लिए मल्चिंग करें', timing: 'morning' }
          ]
        }
      ],
      ta: [
        {
          type: 'weather_alert',
          priority: rainfall > 5 ? 'high' : 'medium',
          title:   rainfall > 5 ? 'கனமழை எச்சரிக்கை' : `வானிலை: ${Math.round(temp)}°C`,
          message: rainfall > 5
            ? `${rainfall}mm மழை எதிர்பார்க்கப்படுகிறது. இன்று எந்த தெளிப்பும் வேண்டாம். வயல் வடிகால்களை சுத்தமாக வைக்கவும்.`
            : `வெப்பநிலை ${Math.round(temp)}°C, ஈரப்பதம் ${humidity}%. ${temp > 35 ? 'காலை அல்லது மாலை நீர்ப்பாசனம் செய்யுங்கள்.' : 'இன்று விவசாயத்திற்கு நல்ல நேரம்.'}`,
          actions: [
            { step: 1, action: rainfall > 5 ? 'வயல் வடிகால்களை சுத்தம் செய்யுங்கள்' : 'மண் ஈரப்பதம் சரிபார்க்கவும்', timing: 'morning' },
            { step: 2, action: 'பயிரில் நோய் அறிகுறிகள் கண்காணியுங்கள்', timing: 'evening' }
          ]
        },
        {
          type: 'fertilizer',
          priority: 'medium',
          title: 'வாராந்திர நைட்ரஜன் சோதனை',
          message: `இலைகள் மஞ்சளாக மாறினால் நைட்ரஜன் குறைபாடு உள்ளது. ${season} பருவத்தில் போதுமான ஊட்டசத்து அவசியம்.`,
          actions: [
            { step: 1, action: 'கீழ் இலைகளில் மஞ்சள் நிறம் சரிபார்க்கவும்', timing: 'morning' },
            { step: 2, action: 'மஞ்சளாக இருந்தால் 50kg/ஏக்கர் யூரியா இடுங்கள்', timing: 'morning' }
          ]
        },
        {
          type: humidity > 80 ? 'pest_warning' : 'general',
          priority: humidity > 80 ? 'high' : 'low',
          title: humidity > 80 ? `பூஞ்சை நோய் அபாயம் — ${humidity}% ஈரப்பதம்` : 'வழக்கமான பயிர் கண்காணிப்பு',
          message: humidity > 80
            ? `${humidity}% அதிக ஈரப்பதம் பூஞ்சை நோய்க்கு சாதகமாக உள்ளது. உடனடியாக பயிரை சோதித்து தடுப்பு தெளிப்பு செய்யுங்கள்.`
            : 'இந்த பருவத்தில் தொடர்ந்து வயல் கண்காணிப்பு அவசியம். இலை நிறம், வாடல் அல்லது பூச்சி சேதம் கவனிக்கவும்.',
          actions: [
            { step: 1, action: humidity > 80 ? 'Mancozeb 75% WP @ 2g/L தண்ணீரில் கலந்து தெளியுங்கள்' : 'அனைத்து செடிகளையும் சோதியுங்கள்', timing: 'morning' },
            { step: 2, action: humidity > 80 ? '7 நாட்களுக்கு பிறகு மீண்டும் தெளியுங்கள்' : 'சிக்கல் உள்ள இடங்களை குறித்துக்கொள்ளுங்கள்', timing: 'weekly' }
          ]
        },
        {
          type: 'irrigation',
          priority: temp > 35 ? 'high' : 'low',
          title: temp > 35 ? `உடனடி நீர்ப்பாசனம் — ${Math.round(temp)}°C வெப்பம்` : 'நீர்ப்பாசன அட்டவணை',
          message: temp > 35
            ? `${Math.round(temp)}°C வெப்பநிலை பயிருக்கு தீங்கு விளைவிக்கும். உங்கள் ${farmer.farmDetails?.landSize || 1} ஏக்கர் நிலத்திற்கு உடனடியாக நீர் பாய்ச்சுங்கள்.`
            : `உங்கள் ${farmer.farmDetails?.irrigationType || 'மழைநீர்'} நீர்ப்பாசன முறையை தொடர்ந்து பின்பற்றுங்கள்.`,
          actions: [
            { step: 1, action: temp > 35 ? 'உடனடியாக நீர் பாய்ச்சுங்கள் — காலை விரும்பத்தக்கது' : 'மண்ணில் ஈரப்பதம் சரிபார்க்கவும்', timing: temp > 35 ? 'immediately' : 'morning' },
            { step: 2, action: 'ஈரப்பதம் தக்கவைக்க மல்ச்சிங் செய்யுங்கள்', timing: 'morning' }
          ]
        }
      ],
      te: [
        {
          type: 'weather_alert',
          priority: rainfall > 5 ? 'high' : 'medium',
          title:   rainfall > 5 ? 'భారీ వర్షం హెచ్చరిక' : `వాతావరణం: ${Math.round(temp)}°C`,
          message: rainfall > 5
            ? `${rainfall}mm వర్షం ఆశించబడుతోంది. నేడు ఎటువంటి పిచికారీ వద్దు. నీరు నిలవకుండా కాలువలు శుభ్రంగా ఉంచండి.`
            : `ఉష్ణోగ్రత ${Math.round(temp)}°C, తేమ ${humidity}%. ${temp > 35 ? 'ఉదయం లేదా సాయంత్రం నీటిపారుదల చేయండి.' : 'ఈ రోజు వ్యవసాయానికి మంచి వాతావరణం.'}`,
          actions: [
            { step: 1, action: rainfall > 5 ? 'పొలం కాలువలు శుభ్రం చేయండి' : 'నేల తేమ తనిఖీ చేయండి', timing: 'morning' },
            { step: 2, action: 'పంటలో వ్యాధి లక్షణాలు పర్యవేక్షించండి', timing: 'evening' }
          ]
        },
        {
          type: 'fertilizer',
          priority: 'medium',
          title: 'వారపు నత్రజని తనిఖీ',
          message: `ఆకులు పాలిపోతే నత్రజని లోపం ఉంది. ${season} కాలంలో తగినంత పోషకాలు అవసరం.`,
          actions: [
            { step: 1, action: 'దిగువ ఆకులలో పాలరంగు సంకేతాలు చూడండి', timing: 'morning' },
            { step: 2, action: 'పాలిపోతే 50kg/ఎకరా యూరియా వేయండి', timing: 'morning' }
          ]
        },
        {
          type: humidity > 80 ? 'pest_warning' : 'general',
          priority: humidity > 80 ? 'high' : 'low',
          title: humidity > 80 ? `శిలీంధ్ర వ్యాధి ప్రమాదం — ${humidity}% తేమ` : 'సాధారణ పంట పర్యవేక్షణ',
          message: humidity > 80
            ? `${humidity}% అధిక తేమ శిలీంధ్ర వ్యాధులకు అనుకూలంగా ఉంది. పంటను వెంటనే తనిఖీ చేసి నివారణ పిచికారీ చేయండి.`
            : 'ఈ కాలంలో క్రమం తప్పకుండా పొలం తనిఖీ చేయండి. ఆకు రంగు మార్పు, వాడిపోవడం లేదా చీడ నష్టం గమనించండి.',
          actions: [
            { step: 1, action: humidity > 80 ? 'Mancozeb 75% WP @ 2g/L నీటిలో కలిపి చల్లండి' : 'అన్ని మొక్కలు తనిఖీ చేయండి', timing: 'morning' },
            { step: 2, action: humidity > 80 ? '7 రోజుల తర్వాత మళ్లీ చల్లండి' : 'సమస్య ఉన్న ప్రాంతాలు గుర్తించండి', timing: 'weekly' }
          ]
        },
        {
          type: 'irrigation',
          priority: temp > 35 ? 'high' : 'low',
          title: temp > 35 ? `తక్షణ నీటిపారుదల — ${Math.round(temp)}°C వేడి` : 'నీటిపారుదల షెడ్యూల్',
          message: temp > 35
            ? `${Math.round(temp)}°C ఉష్ణోగ్రత పంటకు హాని చేస్తుంది. మీ ${farmer.farmDetails?.landSize || 1} ఎకరా పొలానికి వెంటనే నీరు పెట్టండి.`
            : `మీ ${farmer.farmDetails?.irrigationType || 'వర్షాధారిత'} నీటిపారుదల పద్ధతిని క్రమం తప్పకుండా పాటించండి.`,
          actions: [
            { step: 1, action: temp > 35 ? 'వెంటనే నీరు పెట్టండి — ఉదయమే మంచిది' : 'నేలలో తేమ తనిఖీ చేయండి', timing: temp > 35 ? 'immediately' : 'morning' },
            { step: 2, action: 'తేమ నిలవడానికి మల్చింగ్ చేయండి', timing: 'morning' }
          ]
        }
      ],
      pa: [
        {
          type: 'weather_alert',
          priority: rainfall > 5 ? 'high' : 'medium',
          title:   rainfall > 5 ? 'ਭਾਰੀ ਮੀਂਹ ਦੀ ਚੇਤਾਵਨੀ' : `ਮੌਸਮ: ${Math.round(temp)}°C`,
          message: rainfall > 5
            ? `${rainfall}mm ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਅੱਜ ਕੋਈ ਛਿੜਕਾਅ ਨਾ ਕਰੋ। ਪਾਣੀ ਭਰਨ ਤੋਂ ਬਚਾਉਣ ਲਈ ਨਾਲੀਆਂ ਸਾਫ਼ ਰੱਖੋ।`
            : `ਤਾਪਮਾਨ ${Math.round(temp)}°C, ਨਮੀ ${humidity}%। ${temp > 35 ? 'ਗਰਮੀ ਤੋਂ ਬਚਾਉਣ ਲਈ ਸਵੇਰੇ ਜਾਂ ਸ਼ਾਮ ਸਿੰਚਾਈ ਕਰੋ।' : 'ਅੱਜ ਖੇਤੀ ਲਈ ਚੰਗਾ ਮੌਸਮ ਹੈ।'}`,
          actions: [
            { step: 1, action: rainfall > 5 ? 'ਖੇਤ ਦੀਆਂ ਸਾਰੀਆਂ ਨਾਲੀਆਂ ਸਾਫ਼ ਕਰੋ' : 'ਮਿੱਟੀ ਦੀ ਨਮੀ ਜਾਂਚੋ', timing: 'morning' },
            { step: 2, action: 'ਫ਼ਸਲ ਵਿੱਚ ਰੋਗ ਦੇ ਲੱਛਣ ਦੇਖੋ', timing: 'evening' }
          ]
        },
        {
          type: 'fertilizer',
          priority: 'medium',
          title: 'ਹਫ਼ਤਾਵਾਰੀ ਨਾਈਟ੍ਰੋਜਨ ਜਾਂਚ',
          message: `ਪੱਤੇ ਪੀਲੇ ਹੋਣ ਤੋਂ ਨਾਈਟ੍ਰੋਜਨ ਦੀ ਕਮੀ ਦਾ ਸੰਕੇਤ ਮਿਲਦਾ ਹੈ। ${season} ਮੌਸਮ ਵਿੱਚ ਭਰਪੂਰ ਪੋਸ਼ਣ ਜ਼ਰੂਰੀ ਹੈ।`,
          actions: [
            { step: 1, action: 'ਹੇਠਲੇ ਪੱਤਿਆਂ ਵਿੱਚ ਪੀਲਾਪਨ ਦੇਖੋ', timing: 'morning' },
            { step: 2, action: 'ਪੀਲਾਪਨ ਹੋਵੇ ਤਾਂ 50kg/ਏਕੜ ਯੂਰੀਆ ਪਾਓ', timing: 'morning' }
          ]
        },
        {
          type: humidity > 80 ? 'pest_warning' : 'general',
          priority: humidity > 80 ? 'high' : 'low',
          title: humidity > 80 ? `ਉੱਲੀ ਰੋਗ ਦਾ ਖ਼ਤਰਾ — ${humidity}% ਨਮੀ` : 'ਨਿਯਮਿਤ ਫ਼ਸਲ ਨਿਗਰਾਨੀ',
          message: humidity > 80
            ? `${humidity}% ਵੱਧ ਨਮੀ ਉੱਲੀ ਰੋਗ ਲਈ ਅਨੁਕੂਲ ਹੈ। ਤੁਰੰਤ ਫ਼ਸਲ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਰੋਕਥਾਮ ਲਈ ਛਿੜਕਾਅ ਕਰੋ।`
            : 'ਇਸ ਮੌਸਮ ਵਿੱਚ ਨਿਯਮਿਤ ਖੇਤ ਨਿਰੀਖਣ ਜ਼ਰੂਰੀ ਹੈ। ਪੱਤਿਆਂ ਦੇ ਰੰਗ, ਮੁਰਝਾਉਣ ਜਾਂ ਕੀੜਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ।',
          actions: [
            { step: 1, action: humidity > 80 ? 'Mancozeb 75% WP @ 2g/L ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਛਿੜਕੋ' : 'ਸਾਰੇ ਪੌਦਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ', timing: 'morning' },
            { step: 2, action: humidity > 80 ? '7 ਦਿਨਾਂ ਬਾਅਦ ਦੁਬਾਰਾ ਛਿੜਕੋ' : 'ਸਮੱਸਿਆ ਵਾਲੀਆਂ ਥਾਵਾਂ ਨੋਟ ਕਰੋ', timing: 'weekly' }
          ]
        },
        {
          type: 'irrigation',
          priority: temp > 35 ? 'high' : 'low',
          title: temp > 35 ? `ਤੁਰੰਤ ਸਿੰਚਾਈ — ${Math.round(temp)}°C ਗਰਮੀ` : 'ਸਿੰਚਾਈ ਕਾਰਜਕ੍ਰਮ',
          message: temp > 35
            ? `${Math.round(temp)}°C ਤਾਪਮਾਨ ਫ਼ਸਲ ਨੂੰ ਨੁਕਸਾਨ ਕਰ ਸਕਦਾ ਹੈ। ਆਪਣੇ ${farmer.farmDetails?.landSize || 1} ਏਕੜ ਖੇਤ ਵਿੱਚ ਤੁਰੰਤ ਸਿੰਚਾਈ ਕਰੋ।`
            : `ਆਪਣੇ ${farmer.farmDetails?.irrigationType || 'ਬਾਰਸ਼ ਅਧਾਰਿਤ'} ਸਿੰਚਾਈ ਦੇ ਨਿਯਮਿਤ ਕਾਰਜਕ੍ਰਮ ਦੀ ਪਾਲਣਾ ਕਰੋ।`,
          actions: [
            { step: 1, action: temp > 35 ? 'ਤੁਰੰਤ ਸਿੰਚਾਈ ਕਰੋ — ਸਵੇਰੇ ਜਲਦੀ' : 'ਮਿੱਟੀ ਵਿੱਚ ਨਮੀ ਜਾਂਚੋ', timing: temp > 35 ? 'immediately' : 'morning' },
            { step: 2, action: 'ਨਮੀ ਬਣਾਈ ਰੱਖਣ ਲਈ ਮਲਚਿੰਗ ਕਰੋ', timing: 'morning' }
          ]
        }
      ],
      mr: [
        {
          type: 'weather_alert',
          priority: rainfall > 5 ? 'high' : 'medium',
          title:   rainfall > 5 ? 'जड पाऊस चेतावनी' : `हवामान: ${Math.round(temp)}°C`,
          message: rainfall > 5
            ? `${rainfall}mm पाऊस अपेक्षित आहे. आज कोणतेही फवारणी करू नका. जलसाठा होऊ नये म्हणून नाल्या स्वच्छ ठेवा.`
            : `तापमान ${Math.round(temp)}°C आहे, आर्द्रता ${humidity}%. ${temp > 35 ? 'उष्णतेपासून बचाव करण्यासाठी सकाळी किंवा संध्याकाळी सिंचन करा.' : 'आज शेतीसाठी चांगले हवामान आहे.'}`,
          actions: [
            { step: 1, action: rainfall > 5 ? 'शेताच्या सर्व नाल्या साफ करा' : 'मातीतील ओलावा तपासा', timing: 'morning' },
            { step: 2, action: 'पिकात रोगाची लक्षणे पहा', timing: 'evening' }
          ]
        },
        {
          type: 'fertilizer',
          priority: 'medium',
          title: 'साप्ताहिक नायट्रोजन तपासणी',
          message: `पाने पिवळी पडल्यास नायट्रोजनची कमतरता आहे. ${season} हंगामात पुरेसे पोषण आवश्यक आहे.`,
          actions: [
            { step: 1, action: 'खालच्या पानांमध्ये पिवळेपणा तपासा', timing: 'morning' },
            { step: 2, action: 'पिवळेपणा असल्यास 50kg/एकर युरिया टाका', timing: 'morning' }
          ]
        },
        {
          type: humidity > 80 ? 'pest_warning' : 'general',
          priority: humidity > 80 ? 'high' : 'low',
          title: humidity > 80 ? `बुरशीजन्य रोगाचा धोका — ${humidity}% आर्द्रता` : 'नियमित पीक निरीक्षण',
          message: humidity > 80
            ? `${humidity}% जास्त आर्द्रतेमुळे बुरशीजन्य रोगाचा धोका आहे. ताबडतोब पीक तपासा आणि प्रतिबंधात्मक फवारणी करा.`
            : 'या हंगामात नियमित शेत तपासणी आवश्यक आहे. पानांचा रंग, कोमेजणे किंवा कीड नुकसान पहा.',
          actions: [
            { step: 1, action: humidity > 80 ? 'Mancozeb 75% WP @ 2g/L पाण्यात मिसळून फवारा' : 'सर्व झाडांची तपासणी करा', timing: 'morning' },
            { step: 2, action: humidity > 80 ? '7 दिवसांनी पुन्हा फवारा' : 'समस्याग्रस्त भाग नोंदवा', timing: 'weekly' }
          ]
        },
        {
          type: 'irrigation',
          priority: temp > 35 ? 'high' : 'low',
          title: temp > 35 ? `तातडीचे सिंचन — ${Math.round(temp)}°C उष्णता` : 'सिंचन वेळापत्रक',
          message: temp > 35
            ? `${Math.round(temp)}°C तापमान पिकाला हानी पोहोचवू शकते. आपल्या ${farmer.farmDetails?.landSize || 1} एकर शेतात तातडीने सिंचन करा.`
            : `आपल्या ${farmer.farmDetails?.irrigationType || 'पावसावर अवलंबित'} सिंचन पद्धतीचे नियमित वेळापत्रक पाळा.`,
          actions: [
            { step: 1, action: temp > 35 ? 'तातडीने सिंचन करा — सकाळी लवकर' : 'मातीतील ओलावा तपासा', timing: temp > 35 ? 'immediately' : 'morning' },
            { step: 2, action: 'ओलावा टिकवण्यासाठी मल्चिंग करा', timing: 'morning' }
          ]
        }
      ],
    };

    advisoryData = FALLBACK[lang] || FALLBACK.en;
    console.log(`✅ Using weather-based fallback advisory in ${lang}`);
  }

  await Advisory.deleteMany({
    farmer: farmer._id,
    createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
  });

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

  console.log(`Saving ${toSave.length} advisories for ${farmer.name}`);
  const saved = await Advisory.insertMany(toSave);
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