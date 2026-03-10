// backend/src/controllers/scheme.controller.js
import Scheme from '../models/Scheme.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/schemes — get all + filter by farmer profile
export const getSchemes = asyncHandler(async (req, res) => {
  const { category, state } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  if (state) query.$or = [{ isNational: true }, { state }];

  const schemes = await Scheme.find(query).sort({ createdAt: -1 });
  ApiResponse.success(res, schemes, 'Schemes fetched');
});

// GET /api/schemes/matched — AI-match schemes to logged-in farmer
export const getMatchedSchemes = asyncHandler(async (req, res) => {
  const farmer = req.user;
  const allSchemes = await Scheme.find({ isActive: true });

  const matched = allSchemes.filter(scheme => {
    const e = scheme.eligibility;

    // Land size check
    if (e.minLandSize && farmer.farmDetails?.landSize < e.minLandSize) return false;
    if (e.maxLandSize && farmer.farmDetails?.landSize > e.maxLandSize) return false;

    // State check
    if (e.states?.length && !e.states.includes(farmer.location?.state)) return false;

    return true;
  });

  ApiResponse.success(res, matched, `${matched.length} schemes matched`);
});

// POST /api/schemes — admin create scheme
export const createScheme = asyncHandler(async (req, res) => {
  const scheme = await Scheme.create(req.body);
  ApiResponse.success(res, scheme, 'Scheme created', 201);
});

// Seed demo schemes
export const seedSchemes = asyncHandler(async (req, res) => {
  const schemes = [
    {
      name: 'PM Kisan Samman Nidhi',
      shortName: 'PM-KISAN',
      ministry: 'Ministry of Agriculture',
      category: 'income_support',
      description: 'Direct income support of ₹6000/year to small and marginal farmers',
      benefits: ['₹6000 per year in 3 installments', 'Direct bank transfer'],
      eligibility: { maxLandSize: 5 },
      applicationUrl: 'https://pmkisan.gov.in',
      helplineNumber: '155261',
      isActive: true,
      isNational: true
    },
    {
      name: 'Pradhan Mantri Fasal Bima Yojana',
      shortName: 'PMFBY',
      ministry: 'Ministry of Agriculture',
      category: 'insurance',
      description: 'Crop insurance scheme providing financial support to farmers suffering crop loss',
      benefits: ['Low premium rates', 'Full insured sum coverage', 'Quick claim settlement'],
      eligibility: {},
      applicationUrl: 'https://pmfby.gov.in',
      helplineNumber: '1800-180-1551',
      isActive: true,
      isNational: true
    },
    {
      name: 'Kisan Credit Card',
      shortName: 'KCC',
      ministry: 'Ministry of Finance',
      category: 'loan',
      description: 'Flexible credit for farmers to meet agricultural and personal needs',
      benefits: ['Credit up to ₹3 lakh at 4% interest', 'No collateral up to ₹1.6 lakh'],
      eligibility: {},
      applicationUrl: 'https://www.nabard.org',
      helplineNumber: '1800-180-1961',
      isActive: true,
      isNational: true
    }
  ];

  await Scheme.deleteMany({});
  await Scheme.insertMany(schemes);
  ApiResponse.success(res, { count: schemes.length }, 'Schemes seeded');
});