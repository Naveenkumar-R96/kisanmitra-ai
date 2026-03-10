// frontend/src/api/community.api.js
import client from './client';
export const communityApi = {
  getPosts:   (params) => client.get('/community', { params }),
  createPost: (data)   => client.post('/community', data),
  addReply:   (id, data) => client.post(`/community/${id}/reply`, data),
  toggleLike: (id)     => client.patch(`/community/${id}/like`),
};