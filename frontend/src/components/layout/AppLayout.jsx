// frontend/src/components/layout/AppLayout.jsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authSlice";
import {
  LayoutDashboard,
  Leaf,
  Microscope,
  TrendingUp,
  FileText,
  Users,
  LogOut,
  User,
} from "lucide-react";
// Add import at top
import LanguageSwitcher from "../ui/LanguageSwitcher";
const navItems = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    labelKey: "dashboard",
    emoji: "🏠",
  },
  { to: "/advisory", icon: Leaf, labelKey: "advisory", emoji: "🌱" },
  { to: "/pest", icon: Microscope, labelKey: "cropDoctor", emoji: "🔬" },
  { to: "/market", icon: TrendingUp, labelKey: "market", emoji: "📈" },
  { to: "/schemes", icon: FileText, labelKey: "schemes", emoji: "📋" },
  { to: "/community", icon: Users, labelKey: "community", emoji: "👥" },
];

export default function AppLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* ── Sidebar (desktop) ── */}
      <aside
        className="hidden lg:flex flex-col w-64 bg-gray-900 border-r border-gray-800 
                         fixed h-full z-10"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-green-600 rounded-xl flex items-center 
                            justify-center text-xl"
            >
              🌾
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">
                KisanMitra
              </h1>
              <p className="text-green-400 text-xs">AI Advisory</p>
            </div>
          </div>
        </div>

        {/* Farmer Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-amber-600 rounded-full flex items-center 
                            justify-center text-white font-bold"
            >
              {user?.name?.[0] || "K"}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{user?.name}</p>
              <p className="text-gray-400 text-xs">
                {user?.location?.village}, {user?.location?.state}
              </p>
            </div>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="px-4 py-3 border-b border-gray-800">
          <p className="text-gray-500 text-xs mb-2">Language / भाषा</p>
          <LanguageSwitcher />
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, labelKey, emoji }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                 transition-all duration-200 group
                 ${
                   isActive
                     ? "bg-green-600 text-white shadow-lg shadow-green-900/50"
                     : "text-gray-400 hover:bg-gray-800 hover:text-white"
                 }`
              }
            >
              <span className="text-lg">{emoji}</span>
              <span>{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-800 space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
               transition-all ${
                 isActive
                   ? "bg-gray-700 text-white"
                   : "text-gray-400 hover:bg-gray-800 hover:text-white"
               }`
            }
          >
            <User size={16} /> Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm 
                       font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 
                       transition-all"
          >
            <LogOut size={16} /> {t("logout")}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-screen">
        <Outlet />
      </main>

      {/* ── Bottom Nav (mobile) ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 
                      border-t border-gray-800 z-50"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, emoji, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all
                 ${isActive ? "text-green-400" : "text-gray-500"}`
              }
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-[10px] font-medium">{t(labelKey)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
