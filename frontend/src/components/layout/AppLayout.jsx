// frontend/src/components/layout/AppLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authSlice';
import { LogOut, User } from 'lucide-react';
import VoiceAssistant from '../ui/VoiceAssistant';

const navItems = [
  { to: '/dashboard', labelKey: 'dashboard',  emoji: '🏠' },
  { to: '/advisory',  labelKey: 'advisory',   emoji: '🌱' },
  { to: '/pest',      labelKey: 'cropDoctor', emoji: '🔬' },
  { to: '/market',    labelKey: 'market',     emoji: '📈' },
  { to: '/schemes',   labelKey: 'schemes',    emoji: '📋' },
  { to: '/community', labelKey: 'community',  emoji: '👥' },
];

export default function AppLayout() {
  const { t }         = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate      = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 border-r border-gray-800 fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-xl">🌾</div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">KisanMitra</h1>
              <p className="text-green-400 text-xs">AI Advisory</p>
            </div>
          </div>
        </div>

        {/* Farmer info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || 'K'}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{user?.name}</p>
              <p className="text-gray-400 text-xs">{user?.location?.village}, {user?.location?.state}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, labelKey, emoji }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                 ${isActive ? 'bg-green-600 text-white shadow-lg shadow-green-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
              }
            >
              <span className="text-lg">{emoji}</span>
              <span>{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-800 space-y-1">
          <NavLink to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
               ${isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <User size={16} /> {t('profile')}
          </NavLink>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all">
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-screen">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, emoji, labelKey }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all
                 ${isActive ? 'text-green-400' : 'text-gray-500'}`
              }
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-[10px] font-medium">{t(labelKey)}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Voice assistant (floating) */}
      <VoiceAssistant />

    </div>
  );
}