const StatsCard = ({ icon: Icon, label, value, subValue, trend, trendUp, accent = 'blue' }) => {
  const accentMap = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   ring: 'ring-blue-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100' },
    emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-600',ring: 'ring-emerald-100' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  ring: 'ring-amber-100' },
  };
  const colors = accentMap[accent] || accentMap.blue;

  return (
    <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-surface-300 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg ${colors.bg} ring-1 ${colors.ring} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
          {Icon && <Icon size={16} className={colors.text} />}
        </div>
        {trend && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            trendUp
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
              : 'bg-red-50 text-red-600 ring-1 ring-red-100'
          }`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>

      <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-2xl font-bold text-surface-900 tracking-tight leading-none">{value ?? '—'}</p>
      {subValue && (
        <p className="text-xs text-surface-500 mt-1.5 font-medium">{subValue}</p>
      )}
    </div>
  );
};

export default StatsCard;
