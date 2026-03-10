// backend/src/routes/market.routes.js
import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { getPrices, getPriceHistory, seedMarketData, predictPrice } from '../controllers/market.controller.js';
const router = express.Router();

router.get('/',         protect, getPrices);
router.get('/history',  protect, getPriceHistory);
router.post('/seed',    protect, restrictTo('admin'), seedMarketData);
router.post('/predict', protect, predictPrice);
export default router;