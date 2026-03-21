import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { advisoryApi } from "../../api/advisory.api";
import { useAuthStore } from "../../store/authSlice";
import toast from "react-hot-toast";

const PRIORITY_EMOJI = {
  urgent: "🚨",
  high: "⚡",
  medium: "📌",
  low: "📝",
};

const TYPE_EMOJI = {
  weather_alert: "🌧️",
  pest_warning: "⚠️",
  fertilizer: "🌱",
  irrigation: "💧",
  general: "🌾",
};

export default function Advisory() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Force re-render on language change
  const [, setLang] = useState(i18n.language);
  useEffect(() => {
    const handle = (lng) => setLang(lng);
    i18n.on("languageChanged", handle);
    return () => i18n.off("languageChanged", handle);
  }, [i18n]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["advisories"],
    queryFn: () => advisoryApi.getAll({ limit: 4 }),
    enabled: !!user,
    staleTime: 0, // never cache
    cacheTime: 0, // never store
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      advisoryApi.generate({
        lat: user?.location?.coordinates?.lat || 30.9,
        lng: user?.location?.coordinates?.lng || 75.8,
      }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["advisories"] });
      queryClient.invalidateQueries({ queryKey: ["advisories"] });
      toast.success(t("newAdvisoryReady"));
    },
    onError: () => {
      toast.error("Failed to generate. Try again.");
    },
  });

  const advisories = data?.data || [];

  const PRIORITY_CONFIG = {
    urgent: {
      border: "border-red-500/50",
      bg: "bg-red-500/10",
      badge: "bg-red-500/20    text-red-400    border-red-500/30",
      label: t("priorityUrgent"),
    },
    high: {
      border: "border-amber-500/50",
      bg: "bg-amber-500/10",
      badge: "bg-amber-500/20  text-amber-400  border-amber-500/30",
      label: t("priorityHigh"),
    },
    medium: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      badge: "bg-blue-500/20   text-blue-400   border-blue-500/30",
      label: t("priorityMedium"),
    },
    low: {
      border: "border-gray-500/30",
      bg: "bg-gray-500/5",
      badge: "bg-gray-500/20   text-gray-400   border-gray-500/30",
      label: t("priorityLow"),
    },
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-white text-2xl font-bold mb-1">
          🌱 {t("cropAdvisory")}
        </h1>
        <p className="text-gray-400 text-sm mb-6">{t("aiPowered")}</p>
      </motion.div>

      {/* Crop health score */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-900/40 to-emerald-900/20 border border-green-500/30 rounded-3xl p-5 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">{t("cropHealthScore")}</p>
            <p className="text-white text-4xl font-black">
              {advisories.length > 0
                ? Math.max(
                    40,
                    100 -
                      advisories.filter((a) => a.priority === "urgent").length *
                        20 -
                      advisories.filter((a) => a.priority === "high").length *
                        10
                  )
                : 100}
              <span className="text-xl text-gray-400">/100</span>
            </p>
            <p className="text-amber-400 text-sm mt-1">
              ⚠️{" "}
              {
                advisories.filter(
                  (a) => a.priority === "urgent" || a.priority === "high"
                ).length
              }{" "}
              {t("issuesFound")}
            </p>
          </div>
          <div className="w-20 h-20 relative">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#374151"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeDasharray="72 28"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl">
              🌾
            </span>
          </div>
        </div>
      </motion.div>

      {/* Generate button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        onClick={() => generateMutation.mutate()}
        disabled={generateMutation.isPending}
        className="w-full bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 disabled:from-green-900 disabled:to-emerald-900 text-white font-bold py-4 rounded-2xl mb-6 transition-all active:scale-95 shadow-lg shadow-green-900/30"
      >
        {generateMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t("generatingAI")}
          </span>
        ) : (
          t("getAIAdvisory")
        )}
      </motion.button>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-2xl h-36 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* No advisories yet */}
      {!isLoading && advisories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🌾</p>
          <p className="text-white font-bold text-lg mb-2">No advisories yet</p>
          <p className="text-gray-400 text-sm">
            Click the button above to get AI-powered farm advice
          </p>
        </div>
      )}

      {/* Advisory Cards — real AI data */}
      <div className="space-y-4">
        {advisories.map((adv, i) => {
          const cfg = PRIORITY_CONFIG[adv.priority] || PRIORITY_CONFIG.medium;
          const emoji = TYPE_EMOJI[adv.type] || "🌾";
          return (
            <motion.div
              key={adv._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`border rounded-2xl p-5 ${cfg.border} ${cfg.bg}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-white font-bold">{adv.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${cfg.badge}`}
                    >
                      {PRIORITY_EMOJI[adv.priority]} {cfg.label}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{adv.message}</p>
                </div>
              </div>

              {/* Actions */}
              {adv.actions?.length > 0 && (
                <div className="space-y-2 pl-12">
                  {adv.actions.map((action, ai) => (
                    <div
                      key={ai}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <span className="text-green-500 font-bold mt-0.5">
                        {action.step}.
                      </span>
                      <span>{action.action}</span>
                      {action.timing && (
                        <span className="ml-auto text-xs text-gray-500 capitalize">
                          ⏰ {action.timing}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Weather context */}
              {adv.weatherContext?.temperature && (
                <div className="mt-3 pl-12 flex gap-3 text-xs text-gray-500">
                  <span>🌡️ {Math.round(adv.weatherContext.temperature)}°C</span>
                  <span>💧 {adv.weatherContext.humidity}%</span>
                  <span>☁️ {adv.weatherContext.condition}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pl-12">
                <span className="text-xs text-gray-500">
                  {new Date(adv.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => advisoryApi.markRead(adv._id)}
                  className="text-xs text-green-400 hover:text-green-300 font-medium transition-all"
                >
                  {t("markRead")}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
