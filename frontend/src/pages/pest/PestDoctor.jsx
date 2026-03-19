import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { pestApi } from '../../api/pest.api';

const PEST_TIPS = {
  en: ['Take a close-up of the leaf', 'Use good lighting', 'Focus on the affected area', 'Avoid blurry photos'],
  hi: ['पत्ती का क्लोज-अप फोटो लें', 'अच्छी रोशनी में फोटो लें', 'रोगग्रस्त हिस्से को फोकस में रखें', 'धुंधली फोटो से बचें'],
  pa: ['ਪੱਤੇ ਦੀ ਕਲੋਜ਼-ਅੱਪ ਫ਼ੋਟੋ ਲਓ', 'ਚੰਗੀ ਰੋਸ਼ਨੀ ਵਿੱਚ ਫ਼ੋਟੋ ਲਓ', 'ਰੋਗੀ ਹਿੱਸੇ ਨੂੰ ਫੋਕਸ ਵਿੱਚ ਰੱਖੋ', 'ਧੁੰਦਲੀ ਫ਼ੋਟੋ ਤੋਂ ਬਚੋ'],
  ta: ['இலையின் க்ளோஸ்-அப் புகைப்படம் எடுக்கவும்', 'நல்ல வெளிச்சத்தில் புகைப்படம் எடுக்கவும்', 'பாதிக்கப்பட்ட பகுதியை ஃபோகஸ் செய்யவும்', 'மங்கலான புகைப்படங்களை தவிர்க்கவும்'],
  te: ['ఆకు యొక్క క్లోజ్-అప్ ఫోటో తీయండి', 'మంచి వెలుతురులో ఫోటో తీయండి', 'ప్రభావిత భాగాన్ని ఫోకస్ చేయండి', 'మసకబారిన ఫోటోలను నివారించండి'],
  mr: ['पानाचा क्लोज-अप फोटो घ्या', 'चांगल्या प्रकाशात फोटो घ्या', 'बाधित भागावर फोकस करा', 'अस्पष्ट फोटो टाळा'],
};

export default function PestDoctor() {
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  // Force re-render on language change
  const [, setLang] = useState(i18n.language);
  useEffect(() => {
    const handle = (lng) => setLang(lng);
    i18n.on('languageChanged', handle);
    return () => i18n.off('languageChanged', handle);
  }, [i18n]);

  const lang = i18n.language || 'en';
  const tips = PEST_TIPS[lang] || PEST_TIPS.en;

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1
  });

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      const res = await pestApi.analyze(formData);
      setResult(res.data.aiResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setImage(null); setPreview(null); setResult(null); };

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-white text-2xl font-bold mb-1">🔬 {t('pestDoctor')}</h1>
        <p className="text-gray-400 text-sm mb-6">{t('pestSubtitle')}</p>
      </motion.div>

      {/* Upload zone */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 mb-6
            ${isDragActive    ? 'border-green-400 bg-green-500/10'
            : preview         ? 'border-green-600 bg-green-500/5'
            :                   'border-gray-700 bg-gray-900 hover:border-green-600 hover:bg-green-500/5'}`}>
          <input {...getInputProps()} />
          {preview ? (
            <div>
              <img src={preview} alt="preview" className="w-full max-h-64 object-contain rounded-2xl mx-auto mb-3" />
              <p className="text-green-400 text-sm">📸 {t('photoReady')}</p>
            </div>
          ) : (
            <div>
              <p className="text-6xl mb-4">📸</p>
              <p className="text-white font-bold text-lg mb-2">{t('uploadPhoto')}</p>
              <p className="text-gray-400 text-sm">{t('dragDrop')}</p>
              <p className="text-gray-600 text-xs mt-2">JPG, PNG • max 10MB</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Analyze button */}
      {preview && !result && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={analyze}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white font-bold py-4 rounded-2xl mb-6 transition-all active:scale-95"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('analyzing')}
            </span>
          ) : t('analyzeBtn')}
        </motion.button>
      )}

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-500/40 rounded-3xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-4xl">🦠</span>
            <div>
              <h3 className="text-white font-black text-xl">{result.disease}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="bg-gray-700 rounded-full h-2 w-24 overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${result.confidence}%` }} />
                </div>
                <span className="text-red-400 text-sm font-bold">{result.confidence}% {t('confidence')}</span>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 mt-2 inline-block capitalize">
                {result.severity} severity
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-red-400 font-bold text-sm mb-2">💊 {t('chemicalTreatment')}</p>
              {result.treatment?.chemical?.map((tx, i) => (
                <p key={i} className="text-gray-300 text-sm">• {tx}</p>
              ))}
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-green-400 font-bold text-sm mb-2">🌿 {t('organicTreatment')}</p>
              {result.treatment?.organic?.map((tx, i) => (
                <p key={i} className="text-gray-300 text-sm">• {tx}</p>
              ))}
            </div>
            {result.treatment?.timing && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-300">
                ⏰ {t('bestTime')}: {result.treatment.timing}
              </div>
            )}
          </div>

          <button onClick={reset}
            className="w-full mt-4 bg-gray-800 text-gray-300 py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition-all">
            {t('newScan')}
          </button>
        </motion.div>
      )}

      {/* Tips */}
      {!preview && (
        <div className="space-y-3">
          <h3 className="text-gray-400 font-medium text-sm">📌 {t('photoTips')}</h3>
          {tips.map((tip, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-gray-400">
              <span className="text-green-500 font-bold">{i + 1}.</span> {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}