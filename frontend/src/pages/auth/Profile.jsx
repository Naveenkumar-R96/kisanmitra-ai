import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";
import { usePushNotification } from "../../hooks/usePushNotification";

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { permission, subscribed, subscribe } = usePushNotification();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4"
  >
    <h3 className="text-white font-bold mb-3">🔔 Push Notifications</h3>
    <p className="text-gray-400 text-sm mb-4">
      Get daily farm advisories, weather alerts and pest warnings directly on
      your phone.
    </p>
    {permission === "granted" ? (
      <div className="flex items-center gap-2 text-green-400">
        <span>✅</span>
        <span className="text-sm font-medium">Notifications enabled</span>
      </div>
    ) : (
      <button
        onClick={subscribe}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm"
      >
        🔔 Enable Notifications
      </button>
    )}
  </motion.div>;

  const INFO_ROWS = [
    { label: `📱 ${t("phone2")}`, value: user?.phone },
    {
      label: `🌾 ${t("farmLand")}`,
      value: `${user?.farmDetails?.landSize || "N/A"} ${t("acres")}`,
    },
    { label: `🪨 ${t("soil")}`, value: user?.farmDetails?.soilType },
    {
      label: `💧 ${t("irrigation")}`,
      value: user?.farmDetails?.irrigationType,
    },
    { label: `🏘️ ${t("village")}`, value: user?.location?.village },
    { label: `🗺️ ${t("state")}`, value: user?.location?.state },
    { label: `🌐 ${t("language")}`, value: user?.language?.toUpperCase() },
    { label: `👤 ${t("role")}`, value: user?.role },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-white text-2xl font-bold mb-6">
          👤 {t("myProfile")}
        </h1>
      </motion.div>

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 border border-green-500/30 rounded-3xl p-6 mb-6 text-center"
      >
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-3">
          {user?.name?.[0] || "K"}
        </div>
        <h2 className="text-white text-xl font-bold">{user?.name}</h2>
        <p className="text-green-400 text-sm">
          {user?.location?.village}, {user?.location?.state}
        </p>
        <div className="flex justify-center gap-2 mt-3">
          <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 capitalize">
            {user?.role}
          </span>
          {user?.isVerified && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
              {t("verified")}
            </span>
          )}
        </div>
      </motion.div>

      {/* Language switcher */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4"
      >
        <h3 className="text-white font-bold mb-3">🌐 {t("language")}</h3>
        <LanguageSwitcher />
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4"
      >
        <h3 className="text-white font-bold mb-4">{t("accountInfo")}</h3>
        <div className="space-y-3">
          {INFO_ROWS.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
            >
              <span className="text-gray-400 text-sm">{label}</span>
              <span className="text-white text-sm font-medium capitalize">
                {value || "N/A"}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={handleLogout}
        className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 font-bold py-4 rounded-2xl transition-all active:scale-95"
      >
        {t("logoutBtn")}
      </motion.button>
    </div>
  );
}
