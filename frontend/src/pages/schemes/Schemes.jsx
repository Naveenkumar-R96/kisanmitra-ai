// frontend/src/pages/schemes/Schemes.jsx
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { schemesApi } from '../../api/schemes.api';

const CATEGORY_CONFIG = {
  income_support: { emoji: '💰', color: 'text-green-400',  bg: 'bg-green-500/10  border-green-500/30'  },
  insurance:      { emoji: '🛡️', color: 'text-blue-400',   bg: 'bg-blue-500/10   border-blue-500/30'   },
  loan:           { emoji: '🏦', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  subsidy:        { emoji: '🎁', color: 'text-amber-400',  bg: 'bg-amber-500/10  border-amber-500/30'  },
  equipment:      { emoji: '🚜', color: 'text-red-400',    bg: 'bg-red-500/10    border-red-500/30'    },
  training:       { emoji: '📚', color: 'text-teal-400',   bg: 'bg-teal-500/10   border-teal-500/30'   },
};

export default function Schemes() {
  const { data: matched, isLoading } = useQuery({
    queryKey: ['schemes-matched'],
    queryFn: () => schemesApi.getMatched(),
  });

  const schemes = matched?.data || [];

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-white text-2xl font-bold mb-1">📋 सरकारी योजनाएं</h1>
        <p className="text-gray-400 text-sm mb-6">
          आपके प्रोफाइल के अनुसार {schemes.length} योजनाएं मिली हैं
        </p>
      </motion.div>

      {/* Matched badge */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 
                      flex items-center gap-3">
        <span className="text-3xl">🎯</span>
        <div>
          <p className="text-green-400 font-bold">AI मिलान</p>
          <p className="text-gray-400 text-sm">
            आप {schemes.length} योजनाओं के लिए पात्र हैं
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-900 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {schemes.map((scheme, i) => {
            const cfg = CATEGORY_CONFIG[scheme.category] || CATEGORY_CONFIG.subsidy;
            return (
              <motion.div key={scheme._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`border rounded-2xl p-5 ${cfg.bg}`}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{cfg.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-white font-bold">{scheme.shortName || scheme.name}</h3>
                      {scheme.isNational &&
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 
                                         rounded-full border border-blue-500/30">🇮🇳 राष्ट्रीय</span>}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{scheme.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {scheme.benefits?.slice(0, 2).map((b, bi) => (
                        <span key={bi} className="text-xs bg-white/5 text-gray-300 
                                                   px-2 py-1 rounded-lg">✓ {b}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      {scheme.applicationUrl && (
                        <a href={scheme.applicationUrl} target="_blank" rel="noreferrer"
                          className={`text-xs font-bold px-4 py-2 rounded-xl border 
                                     transition-all hover:scale-105 ${cfg.bg} ${cfg.color}`}>
                          आवेदन करें →
                        </a>
                      )}
                      {scheme.helplineNumber && (
                        <a href={`tel:${scheme.helplineNumber}`}
                          className="text-xs text-gray-400 hover:text-white transition-all">
                          📞 {scheme.helplineNumber}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}