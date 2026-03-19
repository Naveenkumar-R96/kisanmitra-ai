// frontend/src/api/advisory.api.js
import client from './client';

export const advisoryApi = {
  getAll:       (params) => client.get('/advisory', { params }),
  generate:     (data)   => client.post('/advisory/generate', data),
  markAsRead:   (id)     => client.patch(`/advisory/${id}/read`),
};