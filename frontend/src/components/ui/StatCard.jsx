// frontend/src/components/ui/StatCard.jsx
import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, sub, color = 'green', delay = 0 }) {
  const colors = {
    green:  'from-green-500/20  to-green-600/10  border-green-500/30  text-green-400',
    amber:  'from-amber-500/20  to-amber-600/10  border-amber-500/30  text-amber-400',
    blue:   'from-blue-500/20   to-blue-600/10   border-blue-500/30   text-blue-400',
    red:    'from-red-500/20    to-red-600/10    border-red-500/30    text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-4`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
          {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </motion.div>
  );
}