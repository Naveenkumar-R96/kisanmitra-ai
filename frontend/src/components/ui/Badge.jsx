// frontend/src/components/ui/Badge.jsx
export default function Badge({ label, type = 'info' }) {
    const styles = {
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      danger:  'bg-red-500/20   text-red-400   border-red-500/30',
      info:    'bg-blue-500/20  text-blue-400  border-blue-500/30',
    };
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${styles[type]}`}>
        {label}
      </span>
    );
  }