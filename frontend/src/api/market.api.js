// frontend/src/api/market.api.js
import client from './client';
export const marketApi = {
  getPrices:  (params) => client.get('/market', { params }),
  getHistory: (params) => client.get('/market/history', { params }),
  seed:       ()       => client.post('/market/seed'),
  predict: (data) => client.post('/market/predict', data),
};