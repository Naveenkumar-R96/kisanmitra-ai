// frontend/src/store/authSlice.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth.api';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (phone, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login({ phone, password });
          const { token, user } = res.data;
          localStorage.setItem('km_token', token);
          set({ token, user, isLoading: false });
          toast.success(`ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ${user.name}! 🌾`);
          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(data);
          const { token, user } = res.data;
          localStorage.setItem('km_token', token);
          set({ token, user, isLoading: false });
          toast.success('Registration successful! 🌾');
          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('km_token');
        localStorage.removeItem('km_user');
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: 'km_auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);