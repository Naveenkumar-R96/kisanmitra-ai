// frontend/src/api/weather.api.js
import client from './client';
export const weatherApi = {
  get: (lat, lng) => client.get(`/weather?lat=${lat}&lng=${lng}`),
};