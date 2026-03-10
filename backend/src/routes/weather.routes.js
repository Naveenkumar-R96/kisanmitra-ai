// backend/src/routes/weather.routes.js
import express from 'express';
import { getWeather } from '../controllers/weather.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getWeather);

export default router;