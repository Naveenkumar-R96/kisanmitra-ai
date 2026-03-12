// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import './utils/i18n';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import PageLoader from './components/ui/PageLoader';
import OfflineBanner from './components/ui/OfflineBanner';

const Login      = lazy(() => import('./pages/auth/Login'));
const Register   = lazy(() => import('./pages/auth/Register'));
const Dashboard  = lazy(() => import('./pages/dashboard/Dashboard'));
const Advisory   = lazy(() => import('./pages/advisory/Advisory'));
const PestDoctor = lazy(() => import('./pages/pest/PestDoctor'));
const Market     = lazy(() => import('./pages/market/Market'));
const Schemes    = lazy(() => import('./pages/schemes/Schemes'));
const Community  = lazy(() => import('./pages/community/Community'));
const Profile    = lazy(() => import('./pages/auth/Profile'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Offline banner always visible */}
        <OfflineBanner />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"  element={<Dashboard />} />
              <Route path="advisory"   element={<Advisory />} />
              <Route path="pest"       element={<PestDoctor />} />
              <Route path="market"     element={<Market />} />
              <Route path="schemes"    element={<Schemes />} />
              <Route path="community"  element={<Community />} />
              <Route path="profile"    element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}