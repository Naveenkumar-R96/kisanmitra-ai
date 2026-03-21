import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { schemesApi } from '../../api/schemes.api';
import { useTranslation } from 'react-i18next';

const CATEGORY_CONFIG = {
  income_support: { emoji: '💰', color: 'text-green-400',  bg: 'bg-green-500/10  border-green-500/30'  },
  insurance:      { emoji: '🛡️', color: 'text-blue-400',   bg: 'bg-blue-500/10   border-blue-500/30'   },
  loan:           { emoji: '🏦', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  subsidy:        { emoji: '🎁', color: 'text-amber-400',  bg: 'bg-amber-500/10  border-amber-500/30'  },
  equipment:      { emoji: '🚜', color: 'text-red-400',    bg: 'bg-red-500/10    border-red-500/30'    },
  training:       { emoji: '📚', color: 'text-teal-400',   bg: 'bg-teal-500/10   border-teal-500/30'   },
};

const CATEGORIES = ['all', 'income_support', 'insurance', 'loan', 'subsidy', 'equipment', 'training'];

export default function Schemes() {
  const [filter,    setFilter]    = useState('all');
  const [expanded,  setExpanded]  = useState(null);
  const { t, i18n } = useTranslation();

  const [, setLang] = useState(i18n.language);
  useEffect(() => {
    const handle = (lng) => setLang(lng);
    i18n.on('languageChanged', handle);
    return () => i18n.off('languageChanged', handle);
  }, [i18n]);

  const { data: matched, isLoading } = useQuery({
    queryKey: ['schemes-matched'],
    queryFn:  () => schemesApi.getMatched(),
  });

  const schemes = matched?.data || [];
  const filtered = filter === 'all'
    ? schemes
    : schemes.filter(s => s.category === filter);

  const CATEGORY_LABELS = {
    all:            { en: 'All',           hi: 'सभी',        pa: 'ਸਭ',      ta: 'அனைத்து', te: 'అన్నీ',    mr: 'सर्व'    },
    income_support: { en: 'Income',        hi: 'आय सहायता',  pa: 'ਆਮਦਨ',   ta: 'வருமானம்', te: 'ఆదాయం',   mr: 'उत्पन्न' },
    insurance:      { en: 'Insurance',     hi: 'बीमा',       pa: 'ਬੀਮਾ',    ta: 'காப்பீடு', te: 'బీమా',     mr: 'विमा'    },
    loan:           { en: 'Loan',          hi: 'ऋण',         pa: 'ਕਰਜ਼ਾ',   ta: 'கடன்',    te: 'రుణం',     mr: 'कर्ज'    },
    subsidy:        { en: 'Subsidy',       hi: 'सब्सिडी',    pa: 'ਸਬਸਿਡੀ', ta: 'மானியம்', te: 'సబ్సిడీ',  mr: 'अनुदान'  },
    equipment:      { en: 'Equipment',     hi: 'उपकरण',      pa: 'ਸਾਜ਼ੋ',   ta: 'உபகரணம்', te: 'పరికరాలు', mr: 'उपकरण'   },
    training:       { en: 'Training',      hi: 'प्रशिक्षण',  pa: 'ਸਿਖਲਾਈ', ta: 'பயிற்சி', te: 'శిక్షణ',   mr: 'प्रशिक्षण'},
  };

  const lang = i18n.language || 'en';
  const getCatLabel = (cat) => CATEGORY_LABELS[cat]?.[lang] || CATEGORY_LABELS[cat]?.en || cat;

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="text-white text-xl font-bold">📋 {t('govtSchemes')}</h1>
          <p className="text-gray-400 text-xs mt-0.5">
            {schemes.length} {t('schemesMatched')}
          </p>
        </motion.div>

        {/* AI Match Banner */}
        {schemes.some(s => s.aiMatched) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-5 flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <p className="text-green-400 font-bold text-sm">🤖 {t('aiMatched')}</p>
              <p className="text-gray-400 text-xs">
                {t('eligible')} {schemes.length} {t('govtSchemes')}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-green-400 font-black text-2xl">{schemes.length}</p>
              <p className="text-gray-500 text-xs">schemes</p>
            </div>
          </motion.div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map(cat => {
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <button key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                  ${filter === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-green-600 hover:text-white'}`}
              >
                {cfg && <span>{cfg.emoji}</span>}
                <span>{getCatLabel(cat)}</span>
                {filter !== cat && cat !== 'all' && (
                  <span className="text-gray-600 text-xs">
                    ({schemes.filter(s => s.category === cat).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-900 rounded-2xl h-28 animate-pulse"/>
            ))}
          </div>
        )}

        {/* Schemes List */}
        <div className="space-y-3">
          {filtered.map((scheme, i) => {
            const cfg       = CATEGORY_CONFIG[scheme.category] || CATEGORY_CONFIG.subsidy;
            const isOpen    = expanded === scheme._id;
            const matchScore = scheme.matchScore || 85;

            return (
              <motion.div key={scheme._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`border rounded-2xl overflow-hidden ${cfg.bg}`}
              >
                {/* Main row */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : scheme._id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{cfg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-white font-bold text-sm">{scheme.shortName}</h3>
                        {scheme.isNational && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                            {t('national')}
                          </span>
                        )}
                        {scheme.aiMatched && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                            🎯 {matchScore}% match
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                        {scheme.description}
                      </p>

                      {/* Benefits pills */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {scheme.benefits?.slice(0, 2).map((b, bi) => (
                          <span key={bi} className="text-xs bg-white/5 text-gray-300 px-2 py-0.5 rounded-lg">
                            ✓ {b}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-gray-500 text-xs flex-shrink-0 mt-1">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-white/10 px-4 pb-4"
                  >
                    {/* All benefits */}
                    {scheme.benefits?.length > 2 && (
                      <div className="mt-3 mb-3">
                        <p className="text-gray-400 text-xs font-medium mb-2">All Benefits:</p>
                        <div className="space-y-1">
                          {scheme.benefits.map((b, bi) => (
                            <p key={bi} className="text-gray-300 text-xs flex items-start gap-1.5">
                              <span className="text-green-500 mt-0.5">✓</span> {b}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Insight */}
                    {scheme.whyEligible && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-3">
                        <p className="text-green-400 text-xs font-medium mb-1">🤖 Why You Qualify:</p>
                        <p className="text-gray-300 text-xs leading-relaxed">{scheme.whyEligible}</p>
                      </div>
                    )}

                    {/* How to apply */}
                    {scheme.howToApply && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-3">
                        <p className="text-blue-400 text-xs font-medium mb-1">📋 How to Apply:</p>
                        <p className="text-gray-300 text-xs leading-relaxed">{scheme.howToApply}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                      {scheme.applicationUrl && (
                        <a href={scheme.applicationUrl} target="_blank" rel="noreferrer"
                          className={`flex-1 text-center text-xs font-bold px-3 py-2.5 rounded-xl border transition-all hover:scale-105 ${cfg.bg} ${cfg.color}`}>
                          {t('applyNow')}
                        </a>
                      )}
                      {scheme.helplineNumber && (
                        <a href={`tel:${scheme.helplineNumber}`}
                          className="flex-1 text-center text-xs font-medium px-3 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all border border-gray-700">
                          📞 {scheme.helplineNumber}
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-white font-bold mb-1">No schemes in this category</p>
            <button onClick={() => setFilter('all')}
              className="text-green-400 text-sm mt-2">
              Show all schemes
            </button>
          </div>
        )}

      </div>
    </div>
  );
}