// frontend/src/api/auth.api.js
import client from './client';
export const authApi = {
  register: (data)        => client.post('/auth/register', data),
  login: (data)           => client.post('/auth/login', data),
  getMe: ()               => client.get('/auth/me'),
  updateProfile: (data)   => client.patch('/auth/update-profile', data),
  changePassword: (data)  => client.patch('/auth/change-password', data),
};