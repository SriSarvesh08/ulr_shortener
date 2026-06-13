import {
  Activity, TrendingUp, Zap, Clock, AlertTriangle,
  BarChart3, Sparkles, Calculator
} from 'lucide-react';

const iconMap = {
  activity: Activity,
  'trending-up': TrendingUp,
  zap: Zap,
  clock: Clock,
  'alert-triangle': AlertTriangle,
  'bar-chart': BarChart3,
  sparkles: Sparkles,
  calculator: Calculator,
};

const colorMap = {
  primary: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    msg: 'text-blue-700',
  },
  cyan: {
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    icon: 'text-sky-600',
    title: 'text-sky-900',
    msg: 'text-sky-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    icon: 'text-emerald-600',
    title: 'text-emerald-900',
    msg: 'text-emerald-700',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    icon: 'text-amber-600',
    title: 'text-amber-900',
    msg: 'text-amber-700',
  },
  rose: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    icon: 'text-red-600',
    title: 'text-red-900',
    msg: 'text-red-700',
  },
  surface: {
    bg: 'bg-surface-50',
    border: 'border-surface-200',
    icon: 'text-surface-600',
    title: 'text-surface-900',
    msg: 'text-surface-600',
  },
};

const SmartSummary = ({ insights = [] }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
      <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-blue-600" />
        Smart Insights
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((insight, i) => {
          const Icon = iconMap[insight.icon] || Activity;
          const colors = colorMap[insight.color] || colorMap.primary;

          return (
            <div
              key={i}
              className={`p-4 rounded-xl border ${colors.bg} ${colors.border} transition-all duration-300 hover:scale-[1.01]`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon size={16} className={colors.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold ${colors.title} mb-0.5`}>
                    {insight.title}
                  </h4>
                  <p className={`text-xs ${colors.msg} leading-relaxed`}>
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartSummary;
