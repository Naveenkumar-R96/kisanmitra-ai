// backend/src/controllers/pest.controller.js
import axios from 'axios';
import FormData from 'form-data';
import PestReport from '../models/PestReport.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/error.middleware.js';
import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new AppError('Only images allowed', 400));
  }
});

// POST /api/pest/analyze
export const analyzePest = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Image is required', 400);

  // Forward image to Python AI service (uses Gemini)
  const form = new FormData();
  form.append('file', req.file.buffer, {
    filename:    req.file.originalname,
    contentType: req.file.mimetype
  });

  let aiResult;
  try {
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/pest/analyze`,
      form,
      { headers: form.getHeaders(), timeout: 30000 }
    );
    aiResult = aiResponse.data.data;
  } catch (err) {
    console.error('Python AI service error:', err.message);
    throw new AppError('AI service unavailable. Please try again.', 503);
  }

  // Save to MongoDB
  const report = await PestReport.create({
    farmer:   req.user._id,
    imageUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
    aiResult: {
      disease:    aiResult.disease,
      confidence: aiResult.confidence,
      severity:   aiResult.severity,
      isHealthy:  aiResult.isHealthy
    },
    treatment: {
      chemical:           aiResult.treatment?.chemical || [],
      organic:            aiResult.treatment?.organic  || [],
      dosage:             aiResult.treatment?.dosage,
      timing:             aiResult.treatment?.timing,
      preventiveMeasures: aiResult.preventiveMeasures  || []
    },
    location: {
      district: req.user.location?.district,
      state:    req.user.location?.state,
    },
    status: 'analyzed'
  });

  ApiResponse.success(res, {
    reportId: report._id,
    aiResult,
    savedAt: report.createdAt
  }, 'Analysis complete');
});

// GET /api/pest/history
export const getPestHistory = asyncHandler(async (req, res) => {
  const reports = await PestReport.find({ farmer: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('-imageUrl');
  ApiResponse.success(res, reports, 'Pest history fetched');
});

// GET /api/pest/outbreaks
export const getOutbreaks = asyncHandler(async (req, res) => {
  const outbreaks = await PestReport.aggregate([
    {
      $match: {
        'aiResult.isHealthy': false,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: {
          disease:  '$aiResult.disease',
          district: '$location.district',
          state:    '$location.state'
        },
        count:         { $sum: 1 },
        avgConfidence: { $avg: '$aiResult.confidence' }
      }
    },
    { $sort:  { count: -1 } },
    { $limit: 50 }
  ]);
  ApiResponse.success(res, outbreaks, 'Outbreak data fetched');
});