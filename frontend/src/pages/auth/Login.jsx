// frontend/src/pages/auth/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authSlice';

export default function Login() {
  const [form, setForm] = useState({ phone: '', password: '' });
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(form.phone, form.password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-gray-950 to-amber-950 
                    flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-3xl flex items-center justify-center 
                          text-4xl mx-auto mb-4 shadow-2xl shadow-green-900/50">🌾</div>
          <h1 className="text-3xl font-bold text-white">KisanMitra AI</h1>
          <p className="text-green-400 mt-1">स्मार्ट खेती, बेहतर जिंदगी</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 
                        rounded-3xl p-8 shadow-2xl">
          <h2 className="text-white text-xl font-bold mb-6">लॉगिन करें</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm font-medium block mb-2">
                📱 फोन नंबर
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none focus:border-green-500 
                           focus:ring-1 focus:ring-green-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm font-medium block mb-2">
                🔒 पासवर्ड
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none focus:border-green-500 
                           focus:ring-1 focus:ring-green-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-900 
                         text-white font-bold py-4 rounded-xl transition-all duration-200 
                         active:scale-95 shadow-lg shadow-green-900/50 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white 
                                   rounded-full animate-spin" />
                  लॉगिन हो रहे हैं...
                </span>
              ) : '🌾 लॉगिन करें'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            नया खाता नहीं है?{' '}
            <Link to="/register" className="text-green-400 hover:text-green-300 font-semibold">
              रजिस्टर करें
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-amber-900/30 border border-amber-800/50 rounded-2xl p-4 text-center">
          <p className="text-amber-400 text-xs font-medium">🎯 Demo: 9876543210 / kisan123</p>
        </div>
      </motion.div>
    </div>
  );
}