// backend/src/controllers/market.controller.js
import MarketPrice from '../models/MarketPrice.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cache } from '../config/redis.js';
import axios from 'axios';

export const predictPrice = asyncHandler(async (req, res) => {
    const { crop, mandi } = req.body;
  
    // Get last 30 days prices from DB
    const history = await MarketPrice.find({
      crop: new RegExp(crop, 'i'),
      'mandi.name': new RegExp(mandi, 'i')
    })
    .sort({ date: -1 })
    .limit(30)
    .select('prices.modal');
  
    const prices = history.map(p => p.prices.modal).reverse();
  
    if (prices.length < 5) {
      return ApiResponse.error(res, 'Not enough historical data', 400);
    }
  
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/price/predict`,
        { crop, mandi, historicalPrices: prices },
        { timeout: 15000 }
      );
  
      ApiResponse.success(res, aiResponse.data.data, 'Price prediction ready');
    } catch {
      ApiResponse.error(res, 'AI service unavailable', 503);
    }
  });

// GET /api/market?crop=wheat&state=Punjab
export const getPrices = asyncHandler(async (req, res) => {
  const { crop, state, mandi } = req.query;
  const cacheKey = `market:${crop}:${state}:${mandi}`;

  const cached = await cache.get(cacheKey);
  if (cached) return ApiResponse.success(res, cached, 'Market prices (cached)');

  const query = {};
  if (crop)  query.crop = new RegExp(crop, 'i');
  if (state) query['mandi.state'] = new RegExp(state, 'i');
  if (mandi) query['mandi.name'] = new RegExp(mandi, 'i');

  const prices = await MarketPrice.find(query)
    .sort({ date: -1 })
    .limit(20);

  await cache.set(cacheKey, prices, 600); // cache 10 mins
  ApiResponse.success(res, prices, 'Market prices fetched');
});

// GET /api/market/history?crop=wheat&mandi=Ludhiana
export const getPriceHistory = asyncHandler(async (req, res) => {
  const { crop, mandi, days = 30 } = req.query;

  const from = new Date();
  from.setDate(from.getDate() - Number(days));

  const history = await MarketPrice.find({
    crop: new RegExp(crop, 'i'),
    'mandi.name': new RegExp(mandi, 'i'),
    date: { $gte: from }
  }).sort({ date: 1 });

  ApiResponse.success(res, history, 'Price history fetched');
});

// POST /api/market/seed (admin — seed dummy data for demo)
export const seedMarketData = asyncHandler(async (req, res) => {
  const crops = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Soybean'];
  const mandis = [
    { name: 'Ludhiana', district: 'Ludhiana', state: 'Punjab' },
    { name: 'Amritsar', district: 'Amritsar', state: 'Punjab' },
    { name: 'Karnal',   district: 'Karnal',   state: 'Haryana' },
  ];

  const data = [];
  const today = new Date();

  crops.forEach(crop => {
    mandis.forEach(mandi => {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const base = { Wheat: 2100, Rice: 1900, Maize: 1600, Cotton: 6200, Soybean: 4500 }[crop];
        const modal = base + Math.floor(Math.random() * 300 - 150);
        data.push({
          crop, mandi,
          prices: { min: modal - 50, max: modal + 80, modal },
          date,
          prediction: {
            price7Days: modal + Math.floor(Math.random() * 100),
            trend: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)],
            recommendation: ['sell_now', 'wait', 'hold'][Math.floor(Math.random() * 3)]
          }
        });
      }
    });
  });

  await MarketPrice.deleteMany({});
  await MarketPrice.insertMany(data);

  ApiResponse.success(res, { count: data.length }, 'Market data seeded');
});