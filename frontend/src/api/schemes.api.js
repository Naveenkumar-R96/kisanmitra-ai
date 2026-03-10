// frontend/src/api/schemes.api.js
import client from './client';
export const schemesApi = {
  getAll:     (params) => client.get('/schemes', { params }),
  getMatched: ()       => client.get('/schemes/matched'),
  seed:       ()       => client.post('/schemes/seed'),
};