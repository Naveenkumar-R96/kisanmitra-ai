import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { marketApi } from '../../api/market.api';
import { useTranslation } from 'react-i18next';

const CROPS  = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Soybean'];
const MANDIS = ['Ludhiana', 'Amritsar', 'Karnal'];

export default function Market() {
  const [selectedCrop,  setSelectedCrop]  = useState('Wheat');
  const [selectedMandi, setSelectedMandi] = useState('Ludhiana');
  const [prediction, setPrediction]       = useState(null);
  const { t } = useTranslation();

  const { data: prices } = useQuery({
    queryKey: ['market', selectedCrop, selectedMandi],
    queryFn: () => marketApi.getPrices({ crop: selectedCrop, mandi: selectedMandi }),
  });

  const { data: history } = useQuery({
    queryKey: ['market-history', selectedCrop, selectedMandi],
    queryFn: () => marketApi.getHistory({ crop: selectedCrop, mandi: selectedMandi, days: 30 }),
  });

  const predictMutation = useMutation({
    mutationFn: () => marketApi.predict({ crop: selectedCrop, mandi: selectedMandi }),
    onSuccess: (res) => setPrediction(res.data),
  });

  const latest    = prices?.data?.[0];
  const chartData = history?.data?.map(p => ({
    date:  new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    price: p.prices.modal
  })) || [];

  const trend = latest?.prediction?.trend;
  const trendConfig = {
    rising:  { icon: '📈', color: 'text-green-400', label: t('rising') },
    falling: { icon: '📉', color: 'text-red-400',   label: t('falling') },
    stable:  { icon: '➡️', color: 'text-amber-400', label: t('stable') },
  };
  const tc = trendConfig[trend] || trendConfig.stable;

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-white text-2xl font-bold mb-1">📈 {t('mandiPrices')}</h1>
        <p className="text-gray-400 text-sm mb-6">{t('liveMarket')}</p>
      </motion.div>

      {/* Crop filter */}
      <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
        {CROPS.map(crop => (
          <button key={crop} onClick={() => { setSelectedCrop(crop); setPrediction(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${selectedCrop === crop ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {crop}
          </button>
        ))}
      </div>

      {/* Mandi filter */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {MANDIS.map(m => (
          <button key={m} onClick={() => { setSelectedMandi(m); setPrediction(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${selectedMandi === m ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            📍 {m}
          </button>
        ))}
      </div>

      {/* Price card */}
      {latest && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 border border-green-500/30 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">{selectedCrop} — {selectedMandi}</p>
              <p className="text-white text-4xl font-black mt-1">
                ₹{latest.prices.modal}
                <span className="text-gray-400 text-base font-normal">{t('perQuintal')}</span>
              </p>
            </div>
            <div className={`text-right ${tc.color}`}>
              <p className="text-4xl">{tc.icon}</p>
              <p className="text-sm font-semibold">{tc.label}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: t('minimum'), value: `₹${latest.prices.min}` },
              { label: t('modal'),   value: `₹${latest.prices.modal}` },
              { label: t('maximum'), value: `₹${latest.prices.max}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs">{label}</p>
                <p className="text-white font-bold">{value}</p>
              </div>
            ))}
          </div>

          {latest.prediction?.recommendation && (
            <div className={`rounded-xl p-3 text-center font-bold text-lg
              ${latest.prediction.recommendation === 'sell_now' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : latest.prediction.recommendation === 'wait'     ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              :                                                     'bg-blue-500/20  text-blue-400  border border-blue-500/30'}`}>
              {latest.prediction.recommendation === 'sell_now' ? t('sellNow')
               : latest.prediction.recommendation === 'wait'   ? t('wait') : t('hold')}
            </div>
          )}
        </motion.div>
      )}

      {/* AI Prediction button */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={() => predictMutation.mutate()}
        disabled={predictMutation.isPending}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-bold py-4 rounded-2xl mb-6 transition-all active:scale-95"
      >
        {predictMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('predicting')}
          </span>
        ) : t('getPrediction')}
      </motion.button>

      {/* Prediction result */}
      {prediction && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-purple-900/20 border border-purple-500/30 rounded-3xl p-6 mb-6">
          <h3 className="text-white font-bold mb-4">🤖 {t('aiPrediction')}</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-gray-400 text-xs mb-1">{t('in7Days')}</p>
              <p className="text-white font-black text-xl">₹{prediction.price7Days}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-gray-400 text-xs mb-1">{t('in14Days')}</p>
              <p className="text-white font-black text-xl">₹{prediction.price14Days}</p>
            </div>
          </div>
          <div className={`rounded-xl p-3 text-center font-bold mb-3
            ${prediction.recommendation === 'sell_now' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : prediction.recommendation === 'wait'     ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            :                                             'bg-blue-500/20  text-blue-400  border border-blue-500/30'}`}>
            {prediction.recommendation === 'sell_now' ? t('sellNow')
             : prediction.recommendation === 'wait'   ? t('wait') : t('hold')}
          </div>
          <p className="text-gray-400 text-sm">{prediction.reasoning}</p>
          {prediction.factors?.map((f, i) => (
            <p key={i} className="text-gray-500 text-xs mt-1">• {f}</p>
          ))}
        </motion.div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
          <h2 className="text-white font-bold mb-4">📊 {t('days30Chart')}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} interval={4} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} domain={['auto','auto']} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12 }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#22c55e' }}
                formatter={v => [`₹${v}`, 'Price']}
              />
              <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}