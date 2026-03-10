// backend/src/controllers/weather.controller.js
import { getWeatherByCoords } from '../services/weather.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/error.middleware.js';

export const getWeather = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) throw new AppError('lat and lng are required', 400);

  const data = await getWeatherByCoords(parseFloat(lat), parseFloat(lng));
  ApiResponse.success(res, data, 'Weather fetched');
});