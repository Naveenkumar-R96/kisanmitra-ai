import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth.api';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (phone, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login({ phone, password });
          const { token, user } = res.data;
          localStorage.setItem('km_token', token);

          // Auto-set language from user profile
          if (user.language) {
            localStorage.setItem('km_lang', user.language);
            const { default: i18n } = await import('../utils/i18n');
            i18n.changeLanguage(user.language);
          }

          set({ token, user, isLoading: false });
          toast.success(`Welcome, ${user.name}! 🌾`);
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

          if (user.language) {
            localStorage.setItem('km_lang', user.language);
            const { default: i18n } = await import('../utils/i18n');
            i18n.changeLanguage(user.language);
          }

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
        localStorage.removeItem('km_auth');
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