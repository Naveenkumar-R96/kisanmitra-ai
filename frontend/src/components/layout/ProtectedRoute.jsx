// frontend/src/components/layout/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authSlice';

export default function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}