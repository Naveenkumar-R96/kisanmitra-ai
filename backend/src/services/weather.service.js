// backend/src/services/weather.service.js
import axios from 'axios';
import { cache } from '../config/redis.js';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherByCoords = async (lat, lng) => {
  const cacheKey = `weather:${lat}:${lng}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const [current, forecast] = await Promise.all([
    axios.get(`${BASE_URL}/weather`, {
      params: { lat, lon: lng, appid: process.env.WEATHER_API_KEY, units: 'metric' }
    }),
    axios.get(`${BASE_URL}/forecast`, {
      params: { lat, lon: lng, appid: process.env.WEATHER_API_KEY, units: 'metric', cnt: 7 }
    })
  ]);

  const data = {
    current: {
      temp: current.data.main.temp,
      feelsLike: current.data.main.feels_like,
      humidity: current.data.main.humidity,
      windSpeed: current.data.wind.speed,
      condition: current.data.weather[0].main,
      description: current.data.weather[0].description,
      icon: current.data.weather[0].icon,
      rainfall: current.data.rain?.['1h'] || 0,
    },
    forecast: forecast.data.list.map(item => ({
      date: item.dt_txt,
      temp: item.main.temp,
      humidity: item.main.humidity,
      condition: item.weather[0].main,
      rainfall: item.rain?.['3h'] || 0,
    })),
    farmingAdvice: generateFarmingAdvice(current.data)
  };

  await cache.set(cacheKey, data, 1800); // cache 30 mins
  return data;
};

const generateFarmingAdvice = (weather) => {
  const advice = [];
  const temp = weather.main.temp;
  const humidity = weather.main.humidity;
  const rain = weather.rain?.['1h'] || 0;

  if (rain > 5) advice.push('🌧️ Heavy rain expected — avoid spraying pesticides today');
  if (humidity > 80) advice.push('💧 High humidity — watch for fungal diseases');
  if (temp > 38) advice.push('🌡️ Extreme heat — irrigate crops in early morning or evening');
  if (temp < 10) advice.push('❄️ Cold weather — protect sensitive crops from frost');
  if (rain === 0 && humidity < 40) advice.push('☀️ Dry conditions — consider irrigation today');

  return advice.length ? advice : ['✅ Weather conditions are favorable for farming today'];
};