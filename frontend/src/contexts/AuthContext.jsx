// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext } from 'react';
import { useAuthStore } from '../store/authSlice';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const auth = useAuthStore();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};