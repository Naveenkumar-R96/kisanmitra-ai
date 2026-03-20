import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { marketApi } from '../../api/market.api';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authSlice';

const ALL_CROPS = [
  { name: 'Wheat',                     emoji: '🌾', key: 'cropWheat'       },
  { name: 'Rice',                      emoji: '🍚', key: 'cropRice'        },
  { name: 'Paddy(Common)',             emoji: '🌾', key: 'cropPaddy'       },
  { name: 'Maize',                     emoji: '🌽', key: 'cropMaize'       },
  { name: 'Cotton',                    emoji: '🌿', key: 'cropCotton'      },
  { name: 'Mustard',                   emoji: '🌻', key: 'cropMustard'     },
  { name: 'Groundnut',                 emoji: '🥜', key: 'cropGroundnut'   },
  { name: 'Onion',                     emoji: '🧅', key: 'cropOnion'       },
  { name: 'Potato',                    emoji: '🥔', key: 'cropPotato'      },
  { name: 'Tomato',                    emoji: '🍅', key: 'cropTomato'      },
  { name: 'Garlic',                    emoji: '🧄', key: 'cropGarlic'      },
  { name: 'Ginger(Green)',             emoji: '🫚', key: 'cropGinger'      },
  { name: 'Banana',                    emoji: '🍌', key: 'cropBanana'      },
  { name: 'Carrot',                    emoji: '🥕', key: 'cropCarrot'      },
  { name: 'Cabbage',                   emoji: '🥬', key: 'cropCabbage'     },
  { name: 'Cauliflower',               emoji: '🥦', key: 'cropCauliflower' },
  { name: 'Brinjal',                   emoji: '🍆', key: 'cropBrinjal'     },
  { name: 'Green Chilli',              emoji: '🌶️', key: 'cropChilli'      },
  { name: 'Green Peas',                emoji: '🫛', key: 'cropPeas'        },
  { name: 'Bajra(Pearl Millet/Cumbu)', emoji: '🌾', key: 'cropBajra'       },
  { name: 'Barley(Jau)',               emoji: '🌾', key: 'cropBarley'      },
  { name: 'Lentil(Masur)(Whole)',      emoji: '🫘', key: 'cropLentil'      },
  { name: 'Green Gram Dal(Moong Dal)', emoji: '🫘', key: 'cropGram'        },
  { name: 'Coconut',                   emoji: '🥥', key: 'cropCoconut'     },
  { name: 'Pumpkin',                   emoji: '🎃', key: 'cropPumpkin'     },
  { name: 'Bitter gourd',              emoji: '🥒', key: 'cropBitterGourd' },
  { name: 'Bottle gourd',              emoji: '🥒', key: 'cropBottleGourd' },
  { name: 'Capsicum',                  emoji: '🫑', key: 'cropCapsicum'    },
  { name: 'Beetroot',                  emoji: '🟣', key: 'cropBeetroot'    },
  { name: 'Coriander(Leaves)',         emoji: '🌿', key: 'cropCoriander'   },
  { name: 'Mint(Pudina)',              emoji: '🌿', key: 'cropMint'        },
  { name: 'Bhindi(Ladies Finger)',     emoji: '🫛', key: 'cropBhindi'      },
  { name: 'Drumstick',                 emoji: '🌿', key: 'cropDrumstick'   },
  { name: 'Pineapple',                 emoji: '🍍', key: 'cropPineapple'   },
  { name: 'Sweet Potato',              emoji: '🍠', key: 'cropSweetPotato' },
  { name: 'Yam(Ratalu)',               emoji: '🍠', key: 'cropYam'         },
  { name: 'Ashgourd',                  emoji: '🎃', key: 'cropAshgourd'    },
  { name: 'Amaranthus',                emoji: '🌿', key: 'cropAmaranthus'  },
];

const ALL_STATES = [
  'All India',
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const CROP_TRANSLATIONS = {
  cropWheat:       { hi: 'गेहूं',          pa: 'ਕਣਕ',         ta: 'கோதுமை',              te: 'గోధుమ',         mr: 'गहू'           },
  cropRice:        { hi: 'चावल',           pa: 'ਚਾਵਲ',        ta: 'அரிசி',               te: 'బియ్యం',        mr: 'तांदूळ'        },
  cropPaddy:       { hi: 'धान',            pa: 'ਝੋਨਾ',        ta: 'நெல்',                te: 'వరి',           mr: 'भात'           },
  cropMaize:       { hi: 'मक्का',          pa: 'ਮੱਕੀ',        ta: 'மக்காச்சோளம்',        te: 'మొక్కజొన్న',    mr: 'मका'           },
  cropCotton:      { hi: 'कपास',           pa: 'ਕਪਾਹ',        ta: 'பருத்தி',             te: 'పత్తి',         mr: 'कापूस'         },
  cropMustard:     { hi: 'सरसों',          pa: 'ਸਰ੍ਹੋਂ',      ta: 'கடுகு',               te: 'ఆవాలు',         mr: 'मोहरी'         },
  cropGroundnut:   { hi: 'मूंगफली',        pa: 'ਮੂੰਗਫਲੀ',     ta: 'வேர்க்கடலை',         te: 'వేరుశనగ',       mr: 'भुईमूग'        },
  cropOnion:       { hi: 'प्याज',          pa: 'ਪਿਆਜ਼',       ta: 'வெங்காயம்',           te: 'ఉల్లిపాయ',      mr: 'कांदा'         },
  cropPotato:      { hi: 'आलू',            pa: 'ਆਲੂ',         ta: 'உருளைக்கிழங்கு',      te: 'బంగాళాదుంప',    mr: 'बटाटा'         },
  cropTomato:      { hi: 'टमाटर',          pa: 'ਟਮਾਟਰ',       ta: 'தக்காளி',             te: 'టమాట',          mr: 'टोमॅटो'        },
  cropGarlic:      { hi: 'लहसुन',          pa: 'ਲਸਣ',         ta: 'பூண்டு',              te: 'వెల్లుల్లి',    mr: 'लसूण'          },
  cropGinger:      { hi: 'अदरक',           pa: 'ਅਦਰਕ',        ta: 'இஞ்சி',               te: 'అల్లం',         mr: 'आले'           },
  cropBanana:      { hi: 'केला',           pa: 'ਕੇਲਾ',        ta: 'வாழைப்பழம்',          te: 'అరటి',          mr: 'केळी'          },
  cropCarrot:      { hi: 'गाजर',           pa: 'ਗਾਜਰ',        ta: 'கேரட்',               te: 'క్యారెట్',       mr: 'गाजर'          },
  cropCabbage:     { hi: 'पत्तागोभी',      pa: 'ਬੰਦਗੋਭੀ',     ta: 'முட்டைக்கோஸ்',        te: 'క్యాబేజీ',       mr: 'कोबी'          },
  cropCauliflower: { hi: 'फूलगोभी',        pa: 'ਫੁੱਲਗੋਭੀ',    ta: 'காலிஃபிளவர்',         te: 'కాలీఫ్లవర్',     mr: 'फुलकोबी'       },
  cropBrinjal:     { hi: 'बैंगन',          pa: 'ਬੈਂਗਣ',        ta: 'கத்தரிக்காய்',        te: 'వంకాయ',         mr: 'वांगी'         },
  cropChilli:      { hi: 'हरी मिर्च',      pa: 'ਹਰੀ ਮਿਰਚ',    ta: 'பச்சை மிளகாய்',       te: 'పచ్చి మిర్చి',   mr: 'हिरवी मिरची'   },
  cropPeas:        { hi: 'हरी मटर',        pa: 'ਮਟਰ',          ta: 'பட்டாணி',             te: 'బఠానీ',         mr: 'वाटाणे'        },
  cropBajra:       { hi: 'बाजरा',          pa: 'ਬਾਜਰਾ',       ta: 'கம்பு',               te: 'సజ్జలు',        mr: 'बाजरी'         },
  cropBarley:      { hi: 'जौ',             pa: 'ਜੌਂ',          ta: 'வாற்கோதுமை',          te: 'బార్లీ',         mr: 'जव'            },
  cropLentil:      { hi: 'मसूर',           pa: 'ਮਸਰ',          ta: 'மசூர் பருப்பு',       te: 'మసూర్ పప్పు',    mr: 'मसूर'          },
  cropGram:        { hi: 'हरा चना',        pa: 'ਹਰਾ ਚਣਾ',     ta: 'பச்சை பருப்பு',       te: 'పెసలు',         mr: 'हिरवा चना'     },
  cropCoconut:     { hi: 'नारियल',         pa: 'ਨਾਰੀਅਲ',      ta: 'தேங்காய்',            te: 'కొబ్బరి',        mr: 'नारळ'          },
  cropPumpkin:     { hi: 'कद्दू',          pa: 'ਕੱਦੂ',         ta: 'பூசணிக்காய்',         te: 'గుమ్మడి',       mr: 'भोपळा'         },
  cropBitterGourd: { hi: 'करेला',          pa: 'ਕਰੇਲਾ',       ta: 'பாகற்காய்',           te: 'కాకర',          mr: 'कारले'         },
  cropBottleGourd: { hi: 'लौकी',           pa: 'ਲੌਕੀ',         ta: 'சுரைக்காய்',          te: 'సొర',           mr: 'दुधी भोपळा'    },
  cropCapsicum:    { hi: 'शिमला मिर्च',    pa: 'ਸ਼ਿਮਲਾ ਮਿਰਚ',  ta: 'குடை மிளகாய்',       te: 'క్యాప్సికం',     mr: 'सिमला मिरची'   },
  cropBeetroot:    { hi: 'चुकंदर',         pa: 'ਚੁਕੰਦਰ',      ta: 'பீட்ரூட்',            te: 'బీట్రూట్',       mr: 'बीट'           },
  cropCoriander:   { hi: 'धनिया',          pa: 'ਧਨੀਆ',        ta: 'கொத்தமல்லி',          te: 'కొత్తిమీర',      mr: 'कोथिंबीर'      },
  cropMint:        { hi: 'पुदीना',         pa: 'ਪੁਦੀਨਾ',      ta: 'புதினா',              te: 'పుదీనా',        mr: 'पुदिना'        },
  cropBhindi:      { hi: 'भिंडी',          pa: 'ਭਿੰਡੀ',        ta: 'வெண்டைக்காய்',        te: 'బెండకాయ',       mr: 'भेंडी'         },
  cropDrumstick:   { hi: 'सहजन',           pa: 'ਸਹਜਨ',        ta: 'முருங்கைக்காய்',       te: 'మునగకాయ',       mr: 'शेवगा'         },
  cropPineapple:   { hi: 'अनानास',         pa: 'ਅਨਾਨਾਸ',      ta: 'அன்னாசிப்பழம்',       te: 'అనాసపండు',      mr: 'अननस'          },
  cropSweetPotato: { hi: 'शकरकंद',         pa: 'ਸ਼ਕਰਕੰਦ',     ta: 'சர்க்கரைவள்ளி',       te: 'చిలకడదుంప',     mr: 'रताळे'         },
  cropYam:         { hi: 'जिमीकंद',        pa: 'ਜਿਮੀਕੰਦ',     ta: 'சேனைக்கிழங்கு',       te: 'చేమడుంప',       mr: 'सुरण'          },
  cropAshgourd:    { hi: 'पेठा',           pa: 'ਪੇਠਾ',         ta: 'நீர்ப்பூசணி',          te: 'బూడిద గుమ్మడి',  mr: 'कोहळा'         },
  cropAmaranthus:  { hi: 'चौलाई',          pa: 'ਚੌਲਾਈ',       ta: 'முளைக்கீரை',           te: 'తోటకూర',        mr: 'राजगिरा'       },
};

export default function Market() {
  const [selectedCrop,  setSelectedCrop]  = useState('Wheat');
  const [selectedState, setSelectedState] = useState('All India');
  const [prediction,    setPrediction]    = useState(null);
  const [searchCrop,    setSearchCrop]    = useState('');
  const [showAll,       setShowAll]       = useState(false);
  const [stateSearch,   setStateSearch]   = useState('');
  const [showStateMenu, setShowStateMenu] = useState(false);
  const { t, i18n } = useTranslation();
  const { user }    = useAuthStore();
  const lang        = i18n.language || 'en';

  const [, setLang] = useState(i18n.language);
  useEffect(() => {
    const handle = (lng) => setLang(lng);
    i18n.on('languageChanged', handle);
    return () => i18n.off('languageChanged', handle);
  }, [i18n]);

  useEffect(() => {
    if (user?.location?.state) setSelectedState(user.location.state);
  }, [user]);

  // Get crop name in current language
  const getCropName = (crop) => {
    if (lang === 'en') return crop.name.split('(')[0].trim();
    return CROP_TRANSLATIONS[crop.key]?.[lang] || crop.name.split('(')[0].trim();
  };

  const stateParam = selectedState === 'All India' ? '' : selectedState;

  const { data: prices, isLoading } = useQuery({
    queryKey: ['market', selectedCrop, selectedState],
    queryFn:  () => marketApi.getPrices({ crop: selectedCrop, state: stateParam }),
    staleTime: 30 * 60 * 1000,
  });

  const { data: history } = useQuery({
    queryKey: ['market-history', selectedCrop, selectedState],
    queryFn:  () => marketApi.getHistory({ crop: selectedCrop, days: 30 }),
    staleTime: 30 * 60 * 1000,
  });

  const predictMutation = useMutation({
    mutationFn: () => marketApi.predict({ crop: selectedCrop, mandi: 'All' }),
    onSuccess:  (res) => setPrediction(res.data),
  });

  const allPrices   = prices?.data || [];
  const isLiveData  = allPrices[0]?.isLiveData;
  const modalPrices = allPrices.map(p => p.prices?.modal || 0).filter(p => p > 0);
  const avgPrice    = modalPrices.length ? Math.round(modalPrices.reduce((a,b)=>a+b,0)/modalPrices.length) : 0;
  const minPrice    = modalPrices.length ? Math.min(...modalPrices) : 0;
  const maxPrice    = modalPrices.length ? Math.max(...modalPrices) : 0;

  const chartData = (history?.data || allPrices).slice(0, 15).map((p, i) => ({
    name:  p.mandi?.name?.split(' ')[0] || `M${i+1}`,
    price: p.prices?.modal || 0,
  }));

  const filteredCrops  = ALL_CROPS.filter(c =>
    getCropName(c).toLowerCase().includes(searchCrop.toLowerCase()) ||
    c.name.toLowerCase().includes(searchCrop.toLowerCase())
  );
  const filteredStates  = ALL_STATES.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );
  const displayedPrices = showAll ? allPrices : allPrices.slice(0, 10);
  const selectedCropObj = ALL_CROPS.find(c => c.name === selectedCrop);
  const selectedEmoji   = selectedCropObj?.emoji || '🌾';
  const selectedCropTranslated = selectedCropObj ? getCropName(selectedCropObj) : selectedCrop;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-2xl mx-auto p-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-white text-xl font-bold">📈 {t('mandiPrices')}</h1>
              <p className="text-gray-400 text-xs mt-0.5">{t('liveMarket')}</p>
            </div>
            {isLiveData && (
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                <span className="text-green-400 text-xs font-medium">
                  LIVE • {allPrices.length} {t('mandis')}
                </span>
              </div>
            )}
          </div>
          {isLiveData && (
            <p className="text-gray-600 text-xs mt-1">
              {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} • data.gov.in
            </p>
          )}
        </motion.div>

        {/* State Filter Dropdown */}
        <div className="relative mb-4" style={{ zIndex: 50 }}>
          <button
            onClick={() => setShowStateMenu(!showStateMenu)}
            className="w-full flex items-center justify-between bg-gray-900 border border-gray-700 hover:border-green-600 rounded-xl px-4 py-3 text-white transition-all"
          >
            <div className="flex items-center gap-2">
              <span>🗺️</span>
              <span className="text-sm font-medium">{selectedState}</span>
              {selectedState !== 'All India' && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                  {t('filterByState') || 'Filtered'}
                </span>
              )}
            </div>
            <span className="text-gray-400 text-xs">{showStateMenu ? '▲' : '▼'}</span>
          </button>

          <AnimatePresence>
            {showStateMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                style={{ zIndex: 100 }}
              >
                <div className="p-2 border-b border-gray-800">
                  <input
                    type="text"
                    placeholder={t('searchState') || 'Search state...'}
                    value={stateSearch}
                    onChange={e => setStateSearch(e.target.value)}
                    className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {filteredStates.map(state => (
                    <button key={state}
                      onClick={() => {
                        setSelectedState(state);
                        setShowStateMenu(false);
                        setStateSearch('');
                        setShowAll(false);
                        setPrediction(null);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-gray-800
                        ${selectedState === state ? 'text-green-400 bg-green-500/10' : 'text-gray-300'}`}
                    >
                      {state === 'All India' ? `🇮🇳 ${t('allIndia') || 'All India'}` : `📍 ${state}`}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Crop Search */}
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder={t('searchCrop') || 'Search crop...'}
            value={searchCrop}
            onChange={e => setSearchCrop(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 transition-all"
          />
        </div>

        {/* Crop Grid — wraps, no horizontal scroll */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filteredCrops.map(crop => (
            <button key={crop.name}
              onClick={() => { setSelectedCrop(crop.name); setPrediction(null); setShowAll(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
                ${selectedCrop === crop.name
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/40'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-green-600 hover:text-white'}`}
            >
              <span className="text-base">{crop.emoji}</span>
              <span>{getCropName(crop)}</span>
            </button>
          ))}
        </div>

        {/* Active Filter Badge */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-gray-500 text-xs">{t('showing') || 'Showing'}:</span>
          <span className="bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg px-2 py-0.5 text-xs font-medium">
            {selectedEmoji} {selectedCropTranslated}
          </span>
          <span className="text-gray-600 text-xs">in</span>
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg px-2 py-0.5 text-xs">
            🗺️ {selectedState === 'All India' ? (t('allIndia') || 'All India') : selectedState}
          </span>
          {selectedState !== 'All India' && (
            <button
              onClick={() => setSelectedState('All India')}
              className="text-gray-500 hover:text-red-400 text-xs transition-all"
            >
              ✕ {t('clearFilter') || 'Clear'}
            </button>
          )}
        </div>

        {/* Price Summary Card */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading"
              className="rounded-2xl bg-gray-900 border border-gray-800 p-5 mb-4 animate-pulse">
              <div className="h-5 bg-gray-800 rounded w-1/3 mb-3"/>
              <div className="h-10 bg-gray-800 rounded w-1/2 mb-4"/>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-800 rounded-xl"/>)}
              </div>
            </motion.div>
          ) : allPrices.length > 0 ? (
            <motion.div key={`${selectedCrop}-${selectedState}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-900/30 to-gray-900 border border-green-500/20 rounded-2xl p-5 mb-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-2xl">{selectedEmoji}</span>
                    <span className="text-gray-300 text-sm font-medium">{selectedCropTranslated}</span>
                    <span className="text-gray-600 text-xs">• {selectedState === 'All India' ? (t('allIndia') || 'All India') : selectedState}</span>
                  </div>
                  <p className="text-white text-4xl font-black">
                    ₹{avgPrice}
                    <span className="text-gray-500 text-sm font-normal ml-1">/quintal</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {t('nationalAvg') || 'National Average'} • {allPrices.length} {t('mandis') || 'mandis'}
                  </p>
                </div>
                <div className="space-y-1.5 flex-shrink-0">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 text-right">
                    <p className="text-gray-500 text-xs">High</p>
                    <p className="text-green-400 text-sm font-bold">₹{maxPrice}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 text-right">
                    <p className="text-gray-500 text-xs">Low</p>
                    <p className="text-red-400 text-sm font-bold">₹{minPrice}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: t('minimum'), value: `₹${minPrice}`, color: 'text-red-400'   },
                  { label: t('modal'),   value: `₹${avgPrice}`, color: 'text-white'     },
                  { label: t('maximum'), value: `₹${maxPrice}`, color: 'text-green-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-black/30 rounded-xl p-3 text-center">
                    <p className="text-gray-500 text-xs mb-0.5 truncate">{label}</p>
                    <p className={`font-bold text-sm ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty"
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-4 text-center">
              <p className="text-4xl mb-3">📊</p>
              <p className="text-white font-bold mb-1">
                {selectedCropTranslated} — {selectedState === 'All India' ? (t('allIndia') || 'All India') : selectedState}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {t('tryAnotherCrop') || 'No data today. Try another crop or state.'}
              </p>
              <button
                onClick={() => setSelectedState('All India')}
                className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-500 transition-all"
              >
                🇮🇳 {t('showAllIndia') || 'Show All India'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Prediction Button */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => predictMutation.mutate()}
          disabled={predictMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-700 to-violet-600 hover:from-purple-600 hover:to-violet-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl mb-4 transition-all active:scale-95 text-sm"
        >
          {predictMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              {t('predicting')}
            </span>
          ) : `🤖 ${t('getPrediction')}`}
        </motion.button>

        {/* Prediction Result */}
        <AnimatePresence>
          {prediction && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-5 mb-4 overflow-hidden"
            >
              <h3 className="text-white font-bold mb-3 text-sm">
                🤖 {t('aiPrediction')} — {selectedCropTranslated}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <p className="text-gray-400 text-xs mb-1">{t('in7Days')}</p>
                  <p className="text-white font-black text-xl">₹{prediction.price7Days}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <p className="text-gray-400 text-xs mb-1">{t('in14Days')}</p>
                  <p className="text-white font-black text-xl">₹{prediction.price14Days}</p>
                </div>
              </div>
              <div className={`rounded-xl p-2.5 text-center font-bold text-sm mb-3 border
                ${prediction.recommendation === 'sell_now'
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : prediction.recommendation === 'wait'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                {prediction.recommendation === 'sell_now' ? `✅ ${t('sellNow')}`
                 : prediction.recommendation === 'wait'   ? `⏳ ${t('wait')}` : `📊 ${t('hold')}`}
              </div>
              {prediction.reasoning && (
                <p className="text-gray-400 text-xs leading-relaxed">{prediction.reasoning}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
            <h2 className="text-white font-bold text-sm mb-4">
              📊 {t('days30Chart')} — {selectedCropTranslated}
            </h2>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top:5, right:5, left:0, bottom:5 }}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize:9 }} interval={2}/>
                <YAxis stroke="#4b5563" tick={{ fontSize:9 }} tickFormatter={v=>`₹${v}`} width={50} domain={['auto','auto']}/>
                <Tooltip
                  contentStyle={{ background:'#111827', border:'1px solid #374151', borderRadius:8, fontSize:12 }}
                  formatter={v => [`₹${v}`, selectedCropTranslated]}
                />
                <Area type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2}
                  fill="url(#pg)" dot={false} activeDot={{ r:4 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Mandi List */}
        {allPrices.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-sm">
                🏪 {t('mandis') || 'Mandis'}
                <span className="text-gray-500 font-normal text-xs ml-1.5">
                  ({allPrices.length})
                </span>
              </h2>
              {!isLiveData && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Cached
                </span>
              )}
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-1 px-3 pb-2 border-b border-gray-800">
              <p className="col-span-5 text-gray-500 text-xs">Mandi</p>
              <p className="col-span-4 text-gray-500 text-xs">State</p>
              <p className="col-span-3 text-gray-500 text-xs text-right">Price</p>
            </div>

            <div className="space-y-1 mt-2">
              {displayedPrices.map((price, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-12 gap-1 items-center bg-gray-800/50 hover:bg-gray-800 rounded-xl px-3 py-2.5 transition-all"
                >
                  <div className="col-span-5">
                    <p className="text-white text-xs font-medium truncate">{price.mandi?.name}</p>
                    <p className="text-gray-600 text-xs truncate">{price.mandi?.district}</p>
                  </div>
                  <div className="col-span-4">
                    <p className="text-gray-400 text-xs truncate">{price.mandi?.state}</p>
                    {price.variety && (
                      <p className="text-gray-600 text-xs truncate">{price.variety}</p>
                    )}
                  </div>
                  <div className="col-span-3 text-right">
                    <p className="text-green-400 text-sm font-bold">₹{price.prices?.modal}</p>
                    <p className="text-gray-600 text-xs">{price.arrivalDate}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {allPrices.length > 10 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-3 py-2.5 text-green-400 hover:text-green-300 text-sm font-medium transition-all border border-gray-800 hover:border-green-700 rounded-xl"
              >
                {showAll
                  ? `▲ ${t('showLess') || 'Show Less'}`
                  : `▼ ${t('showAll') || 'Show All'} ${allPrices.length} ${t('mandis') || 'Mandis'}`}
              </button>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}