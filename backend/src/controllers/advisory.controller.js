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

  const lang         = farmer.language || 'en';
  const languageName = LANGUAGE_NAMES[lang] || 'English';

  // Get weather
  let weather = null;
  let weatherText = 'Weather data unavailable.';
  try {
    weather     = await getWeatherByCoords(lat || 30.9, lng || 75.8);
    weatherText = `Temperature: ${Math.round(weather.current.temp)}°C, Humidity: ${weather.current.humidity}%, Condition: ${weather.current.condition}, Rainfall: ${weather.current.rainfall}mm`;
  } catch (e) {
    console.log('Weather fetch failed:', e.message);
  }

  // Call Python AI service for advisory generation
  let advisoryData = [];
  try {
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/advisory/generate`,
      {
        farmer_name:    farmer.name,
        village:        farmer.location?.village,
        state:          farmer.location?.state,
        land_size:      farmer.farmDetails?.landSize,
        soil_type:      farmer.farmDetails?.soilType,
        irrigation:     farmer.farmDetails?.irrigationType,
        weather:        weatherText,
        language:       languageName,
      },
      { timeout: 30000 }
    );
    advisoryData = response.data.data;
  } catch (err) {
    console.log('AI service failed, using fallback:', err.message);

    // Smart fallback based on weather
    const temp     = weather?.current?.temp     || 25;
    const humidity = weather?.current?.humidity || 60;
    const rainfall = weather?.current?.rainfall || 0;

    const FALLBACK = {
      en: [
        {
          type: 'weather_alert', priority: rainfall > 5 ? 'high' : 'medium',
          title: rainfall > 5 ? 'Rain Alert — Avoid Spraying' : 'Weather Update',
          message: rainfall > 5
            ? `${rainfall}mm rain expected. Do not spray pesticides or fertilizers today.`
            : `Temperature ${Math.round(temp)}°C, Humidity ${humidity}%. Good conditions for farming.`,
          actions: [
            { step: 1, action: rainfall > 5 ? 'Stop irrigation immediately' : 'Check soil moisture', timing: 'morning' },
            { step: 2, action: 'Monitor crop for disease', timing: 'evening' }
          ]
        },
        {
          type: 'fertilizer', priority: 'medium',
          title: 'Weekly Fertilizer Check',
          message: 'Check crop leaves for yellowing which indicates nitrogen deficiency. Apply urea if needed.',
          actions: [
            { step: 1, action: 'Inspect leaves for pale yellow color', timing: 'morning' },
            { step: 2, action: 'Apply 50kg/acre urea if yellowing found', timing: 'morning' }
          ]
        },
        {
          type: 'pest_warning', priority: humidity > 80 ? 'high' : 'low',
          title: humidity > 80 ? 'High Humidity — Fungal Risk' : 'Regular Pest Check',
          message: humidity > 80
            ? `Humidity at ${humidity}%. High risk of fungal disease. Inspect crops carefully.`
            : 'Regular pest monitoring recommended. Check undersides of leaves.',
          actions: [
            { step: 1, action: 'Check for white powder or spots on leaves', timing: 'morning' },
            { step: 2, action: humidity > 80 ? 'Spray Mancozeb 2g/L if fungal signs found' : 'Remove weeds around plants', timing: 'evening' }
          ]
        },
        {
          type: 'general', priority: 'low',
          title: 'Soil Health Reminder',
          message: 'Good soil health leads to better yields. Test your soil every season.',
          actions: [
            { step: 1, action: 'Visit local Krishi Vigyan Kendra for soil testing', timing: 'weekly' },
            { step: 2, action: 'Apply organic compost to improve soil structure', timing: 'weekly' }
          ]
        }
      ],
      hi: [
        {
          type: 'weather_alert', priority: rainfall > 5 ? 'high' : 'medium',
          title: rainfall > 5 ? 'बारिश की चेतावनी — छिड़काव न करें' : 'मौसम अपडेट',
          message: rainfall > 5
            ? `${rainfall}mm बारिश की संभावना। आज कोई भी छिड़काव न करें।`
            : `तापमान ${Math.round(temp)}°C, नमी ${humidity}%। खेती के लिए अच्छी परिस्थितियां।`,
          actions: [
            { step: 1, action: rainfall > 5 ? 'सिंचाई तुरंत बंद करें' : 'मिट्टी की नमी जांचें', timing: 'morning' },
            { step: 2, action: 'फसल में रोग के लक्षण देखें', timing: 'evening' }
          ]
        },
        {
          type: 'fertilizer', priority: 'medium',
          title: 'साप्ताहिक उर्वरक जांच',
          message: 'फसल की पत्तियां पीली हो रही हैं तो नाइट्रोजन की कमी हो सकती है। जरूरत पर यूरिया डालें।',
          actions: [
            { step: 1, action: 'पत्तियों का रंग जांचें', timing: 'morning' },
            { step: 2, action: 'पीलापन हो तो 50kg/एकड़ यूरिया डालें', timing: 'morning' }
          ]
        },
        {
          type: 'pest_warning', priority: humidity > 80 ? 'high' : 'low',
          title: humidity > 80 ? 'अधिक नमी — फफूंद का खतरा' : 'नियमित कीट जांच',
          message: humidity > 80
            ? `नमी ${humidity}% है। फफूंद रोग का खतरा बढ़ा है।`
            : 'नियमित कीट निगरानी करें। पत्तियों के नीचे की तरफ देखें।',
          actions: [
            { step: 1, action: 'पत्तियों पर सफेद पाउडर या धब्बे देखें', timing: 'morning' },
            { step: 2, action: humidity > 80 ? 'Mancozeb 2g/L छिड़कें' : 'पौधों के आसपास खरपतवार हटाएं', timing: 'evening' }
          ]
        },
        {
          type: 'general', priority: 'low',
          title: 'मिट्टी स्वास्थ्य याद दिलाना',
          message: 'अच्छी मिट्टी से अच्छी उपज होती है। हर मौसम में मिट्टी परीक्षण करवाएं।',
          actions: [
            { step: 1, action: 'कृषि विज्ञान केंद्र से मिट्टी परीक्षण करवाएं', timing: 'weekly' },
            { step: 2, action: 'मिट्टी सुधारने के लिए जैविक खाद डालें', timing: 'weekly' }
          ]
        }
      ],
    };

    advisoryData = FALLBACK[lang] || FALLBACK.en;
  }

  // Save to MongoDB
  const weatherContext = weather ? {
    temperature: weather.current.temp,
    humidity:    weather.current.humidity,
    rainfall:    weather.current.rainfall,
    condition:   weather.current.condition,
  } : {};

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