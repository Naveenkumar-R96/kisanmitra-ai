// frontend/src/api/advisory.api.js
import client from './client';

export const advisoryApi = {
  getAll: (params = {}) =>
    client.get('/advisory', { params }),

  generate: (data) =>
    client.post('/advisory/generate', data),

  markRead: (id) =>
    client.patch(`/advisory/${id}/read`),
};