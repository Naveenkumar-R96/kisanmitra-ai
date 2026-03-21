// backend/src/controllers/scheme.controller.js
import Scheme from '../models/Scheme.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import axios from 'axios';

const LANGUAGE_NAMES = {
  en: 'English', hi: 'Hindi', pa: 'Punjabi',
  ta: 'Tamil',   te: 'Telugu', mr: 'Marathi',
};

// GET /api/schemes
export const getSchemes = asyncHandler(async (req, res) => {
  const { category, state } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  if (state) query.$or = [{ isNational: true }, { 'eligibility.states': state }];
  const schemes = await Scheme.find(query).sort({ createdAt: -1 });
  ApiResponse.success(res, schemes, 'Schemes fetched');
});

// GET /api/schemes/matched — Smart AI matching
export const getMatchedSchemes = asyncHandler(async (req, res) => {
  const farmer  = req.user;
  const lang    = farmer.language || 'en';
  const langName = LANGUAGE_NAMES[lang] || 'English';

  // Get all active schemes
  const allSchemes = await Scheme.find({ isActive: true });

  // Basic eligibility filter
  const eligible = allSchemes.filter(scheme => {
    const e = scheme.eligibility;
    const landSize = farmer.farmDetails?.landSize || 0;
    const state    = farmer.location?.state || '';

    if (e.minLandSize && landSize < e.minLandSize) return false;
    if (e.maxLandSize && landSize > e.maxLandSize) return false;
    if (e.states?.length > 0 && !e.states.includes(state)) return false;
    return true;
  });

  // Try Gemini AI for smart matching and translation
  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) throw new Error('No Gemini key');

    const farmerProfile = `
      Name: ${farmer.name}
      State: ${farmer.location?.state}
      Land: ${farmer.farmDetails?.landSize} acres
      Soil: ${farmer.farmDetails?.soilType}
      Irrigation: ${farmer.farmDetails?.irrigationType}
    `;

    const schemeList = eligible.map((s, i) =>
      `${i+1}. ${s.shortName}: ${s.description}`
    ).join('\n');

    const prompt = `You are a government scheme advisor for Indian farmers.

Farmer Profile:
${farmerProfile}

Available Schemes:
${schemeList}

For each scheme, provide a personalized match explanation in ${langName}.
Respond ONLY with valid JSON array:
[
  {
    "schemeIndex": 1,
    "matchScore": 95,
    "whyEligible": "explanation in ${langName} why this farmer qualifies",
    "benefit": "specific benefit amount/detail in ${langName}",
    "howToApply": "simple steps in ${langName}"
  }
]
Only include schemes with matchScore above 60.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      { timeout: 15000 }
    );

    const text  = response.data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const aiMatches = JSON.parse(clean);

    // Merge AI insights with scheme data
    const enriched = aiMatches.map(match => {
      const scheme = eligible[match.schemeIndex - 1];
      if (!scheme) return null;
      return {
        ...scheme.toObject(),
        matchScore:   match.matchScore,
        whyEligible:  match.whyEligible,
        aiInsight:    match.benefit,
        howToApply:   match.howToApply,
        aiMatched:    true,
      };
    }).filter(Boolean).sort((a, b) => b.matchScore - a.matchScore);

    console.log(`✅ AI matched ${enriched.length} schemes for ${farmer.name}`);
    return ApiResponse.success(res, enriched, `${enriched.length} schemes matched`);

  } catch (err) {
    console.log('Gemini scheme matching failed, using basic match:', err.message);
  }

  // Fallback — return eligible schemes with basic info
  const fallback = eligible.map(s => ({
    ...s.toObject(),
    matchScore:  85,
    whyEligible: `You are eligible for ${s.shortName} based on your farm profile.`,
    aiMatched:   false,
  }));

  ApiResponse.success(res, fallback, `${fallback.length} schemes matched`);
});

// POST /api/schemes — admin create
export const createScheme = asyncHandler(async (req, res) => {
  const scheme = await Scheme.create(req.body);
  ApiResponse.success(res, scheme, 'Scheme created', 201);
});

// POST /api/schemes/seed
export const seedSchemes = asyncHandler(async (req, res) => {
  const count = await Scheme.countDocuments();
  ApiResponse.success(res, { count }, `${count} schemes exist`);
});