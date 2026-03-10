// frontend/src/pages/dashboard/Dashboard.jsx
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authSlice";
import { weatherApi } from "../../api/weather.api";
import { schemesApi } from "../../api/schemes.api";
import StatCard from "../../components/ui/StatCard";
import { Link } from "react-router-dom";
import { advisoryApi } from "../../api/advisory.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const QUICK_ACTIONS = [
  {
    to: "/pest",
    emoji: "🔬",
    label: "Crop Doctor",
    color: "bg-red-500/20 border-red-500/30 text-red-400",
  },
  {
    to: "/market",
    emoji: "📈",
    label: "Mandi Bhav",
    color: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  },
  {
    to: "/schemes",
    emoji: "📋",
    label: "Yojanaein",
    color: "bg-purple-500/20 border-purple-500/30 text-purple-400",
  },
  {
    to: "/community",
    emoji: "👥",
    label: "Samudaay",
    color: "bg-amber-500/20 border-amber-500/30 text-amber-400",
  },
];

const DUMMY_ADVISORIES = [
  {
    id: 1,
    type: "weather_alert",
    priority: "high",
    title: "बारिश की संभावना",
    message: "अगले 24 घंटों में बारिश हो सकती है। सिंचाई न करें।",
    emoji: "🌧️",
  },
  {
    id: 2,
    type: "fertilizer",
    priority: "medium",
    title: "यूरिया डालें",
    message: "गेहूं की फसल में अभी यूरिया की जरूरत है।",
    emoji: "🌱",
  },
  {
    id: 3,
    type: "pest_warning",
    priority: "urgent",
    title: "कीट चेतावनी",
    message: "आपके क्षेत्र में पीला रतुआ रोग फैल रहा है।",
    emoji: "⚠️",
  },
];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const generateMutation = useMutation({
    mutationFn: () =>
      advisoryApi.generate({
        lat: user?.location?.coordinates?.lat || 30.9,
        lng: user?.location?.coordinates?.lng || 75.8,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["advisories"]);
      toast.success("नई सलाह तैयार है! 🌾");
    },
  });
  const { user } = useAuthStore();

  const { data: weather } = useQuery({
    queryKey: ["weather", user?.location?.coordinates],
    queryFn: () => weatherApi.get(30.9, 75.8),
    enabled: true,
    staleTime: 30 * 60 * 1000,
  });

  const { data: schemes } = useQuery({
    queryKey: ["schemes-matched"],
    queryFn: () => schemesApi.getMatched(),
  });

  const w = weather?.data?.current;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "सुप्रभात" : hour < 17 ? "नमस्ते" : "शुभ संध्या";

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{greeting} 👋</p>
            <h1 className="text-white text-2xl font-bold">{user?.name}</h1>
            <p className="text-green-400 text-sm">
              📍 {user?.location?.village}, {user?.location?.state}
            </p>
          </div>
          {/* Weather widget */}
          {w && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3 text-right">
              <p className="text-3xl">
                {w.condition === "Rain"
                  ? "🌧️"
                  : w.condition === "Clouds"
                  ? "☁️"
                  : w.condition === "Clear"
                  ? "☀️"
                  : "🌤️"}
              </p>
              <p className="text-white font-bold text-lg">
                {Math.round(w.temp)}°C
              </p>
              <p className="text-gray-400 text-xs">{w.humidity}% नमी</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon="🌾"
          label="जमीन"
          value={`${user?.farmDetails?.landSize || 0} एकड़`}
          color="green"
          delay={0.1}
        />
        <StatCard
          icon="🌡️"
          label="तापमान"
          value={w ? `${Math.round(w.temp)}°C` : "--"}
          color="amber"
          delay={0.2}
        />
        <StatCard
          icon="💧"
          label="नमी"
          value={w ? `${w.humidity}%` : "--"}
          color="blue"
          delay={0.3}
        />
        <StatCard
          icon="📋"
          label="योजनाएं"
          value={schemes?.data?.length || 0}
          sub="उपलब्ध"
          color="green"
          delay={0.4}
        />
      </div>
      {/* Generate Advisory Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => generateMutation.mutate()}
        disabled={generateMutation.isPending}
        className="w-full bg-gradient-to-r from-green-700 to-emerald-600 
             hover:from-green-600 hover:to-emerald-500
             disabled:from-green-900 disabled:to-emerald-900
             text-white font-bold py-4 rounded-2xl mb-6 transition-all 
             active:scale-95 shadow-lg shadow-green-900/30"
      >
        {generateMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            AI सलाह तैयार कर रही है...
          </span>
        ) : (
          "🌾 आज की AI सलाह लें"
        )}
      </motion.button>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <h2 className="text-white font-bold text-lg mb-3">त्वरित कार्य</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ to, emoji, label, color }) => (
            <Link
              key={to}
              to={to}
              className={`border rounded-2xl p-4 text-center transition-all 
                         hover:scale-105 active:scale-95 ${color}`}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="text-xs font-semibold">{label}</div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Farming Advice from Weather ── */}
      {weather?.data?.farmingAdvice?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-white font-bold text-lg mb-3">🌤️ मौसम सलाह</h2>
          <div className="space-y-2">
            {weather.data.farmingAdvice.map((advice, i) => (
              <div
                key={i}
                className="bg-blue-500/10 border border-blue-500/20 
                                      rounded-xl px-4 py-3 text-blue-300 text-sm"
              >
                {advice}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Today's Advisories ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg">📢 आज की सलाह</h2>
          <Link
            to="/advisory"
            className="text-green-400 text-sm hover:text-green-300"
          >
            सभी देखें →
          </Link>
        </div>
        <div className="space-y-3">
          {DUMMY_ADVISORIES.map((adv, i) => (
            <motion.div
              key={adv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`bg-gray-900 border rounded-2xl p-4 flex gap-4 items-start
                ${
                  adv.priority === "urgent"
                    ? "border-red-500/40"
                    : adv.priority === "high"
                    ? "border-amber-500/40"
                    : "border-gray-800"
                }`}
            >
              <span className="text-3xl">{adv.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold text-sm">
                    {adv.title}
                  </p>
                  {adv.priority === "urgent" && (
                    <span
                      className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 
                                     rounded-full border border-red-500/30"
                    >
                      जरूरी
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{adv.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
