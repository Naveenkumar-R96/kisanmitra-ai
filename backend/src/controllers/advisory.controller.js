// backend/src/controllers/advisory.controller.js
import Advisory from '../models/Advisory.js';
import { getWeatherByCoords } from '../services/weather.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/advisory — get farmer's advisories
export const getAdvisories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, isRead } = req.query;
  const query = { farmer: req.user._id };
  if (type)   query.type   = type;
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const total = await Advisory.countDocuments(query);
  const advisories = await Advisory.find(query)
    .populate('crop', 'name season')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  ApiResponse.paginated(res, advisories, total, page, limit);
});

// POST /api/advisory/generate — AI generate advisory for farmer
export const generateAdvisory = asyncHandler(async (req, res) => {
  const farmer = req.user;
  const { cropId, lat, lng } = req.body;

  // Get weather context
  let weatherContext = {};
  try {
    const weather = await getWeatherByCoords(lat || 30.9, lng || 75.8);
    weatherContext = {
      temperature: weather.current.temp,
      humidity:    weather.current.humidity,
      rainfall:    weather.current.rainfall,
      condition:   weather.current.condition
    };
  } catch (e) {
    console.log('Weather fetch failed for advisory:', e.message);
  }

  // Generate context-aware advisories
  const advisories = [];
  const { temp, humidity, rainfall } = weatherContext;

  if (rainfall > 5) {
    advisories.push({
      farmer:  farmer._id,
      crop:    cropId,
      type:    'weather_alert',
      priority: 'high',
      title:   'बारिश की संभावना — छिड़काव न करें',
      message: `अगले 24 घंटों में ${rainfall}mm बारिश होने की संभावना है। कोई भी कीटनाशक या उर्वरक का छिड़काव न करें।`,
      actions: [
        { step: 1, action: 'सिंचाई बंद रखें', timing: 'immediately' },
        { step: 2, action: 'नाली साफ रखें ताकि पानी न भरे', timing: 'morning' },
        { step: 3, action: 'फसल की निगरानी करें', timing: 'evening' }
      ],
      weatherContext,
      cropStage: 'vegetative'
    });
  }

  if (humidity > 80) {
    advisories.push({
      farmer:   farmer._id,
      crop:     cropId,
      type:     'pest_warning',
      priority: 'medium',
      title:    'फंगल रोग का खतरा',
      message:  `नमी ${humidity}% से अधिक है। फफूंद रोग फैलने का खतरा बढ़ गया है।`,
      actions: [
        { step: 1, action: 'Mancozeb 75% WP 2g/L पानी में मिलाकर छिड़कें', timing: 'morning' },
        { step: 2, action: 'पत्तियों का निरीक्षण करें', timing: 'morning' }
      ],
      weatherContext,
      cropStage: 'vegetative'
    });
  }

  if (temp > 35) {
    advisories.push({
      farmer:   farmer._id,
      crop:     cropId,
      type:     'irrigation',
      priority: 'high',
      title:    'अत्यधिक गर्मी — सिंचाई करें',
      message:  `तापमान ${Math.round(temp)}°C है। फसल को तुरंत पानी की जरूरत है।`,
      actions: [
        { step: 1, action: 'शाम 5 बजे के बाद सिंचाई करें', timing: 'evening' },
        { step: 2, action: 'Mulching करें नमी बनाए रखने के लिए', timing: 'morning' }
      ],
      weatherContext,
      cropStage: 'vegetative'
    });
  }

  // Always add a daily fertilizer advisory
  advisories.push({
    farmer:   farmer._id,
    crop:     cropId,
    type:     'fertilizer',
    priority: 'medium',
    title:    'उर्वरक की जांच करें',
    message:  'इस सप्ताह फसल की पत्तियों का रंग जांचें। पीलापन हो तो यूरिया डालें।',
    actions: [
      { step: 1, action: '50kg/एकड़ यूरिया डालें यदि पत्तियां पीली हों', timing: 'morning' },
      { step: 2, action: 'तुरंत बाद हल्की सिंचाई करें', timing: 'morning' }
    ],
    weatherContext,
    cropStage: 'vegetative'
  });

  // Save all to DB
  const saved = await Advisory.insertMany(advisories);
  ApiResponse.success(res, saved, `${saved.length} advisories generated`, 201);
});

// PATCH /api/advisory/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  await Advisory.findOneAndUpdate(
    { _id: req.params.id, farmer: req.user._id },
    { isRead: true }
  );
  ApiResponse.success(res, null, 'Marked as read');
});