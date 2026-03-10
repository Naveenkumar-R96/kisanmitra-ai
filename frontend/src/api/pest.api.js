// frontend/src/api/pest.api.js
import client from './client';

export const pestApi = {
  analyze: (formData) => client.post('/pest/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 35000   // AI takes time
  }),
  getHistory: () => client.get('/pest/history'),
  getOutbreaks: () => client.get('/pest/outbreaks'),
};