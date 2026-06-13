import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

const SafetyBadge = ({ score, status, showScore = false, size = 'sm' }) => {
  const config = {
    Safe: {
      icon: ShieldCheck,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/25',
      text: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      label: 'Safe',
    },
    'Medium Risk': {
      icon: AlertTriangle,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/25',
      text: 'text-amber-400',
      barColor: 'bg-amber-500',
      label: 'Medium Risk',
    },
    'High Risk': {
      icon: ShieldAlert,
      bg: 'bg-red-500/10',
      border: 'border-red-500/25',
      text: 'text-red-400',
      barColor: 'bg-red-500',
      label: 'High Risk',
    },
  };

  const c = config[status] || config['Safe'];
  const Icon = c.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSize = size === 'lg' ? 14 : size === 'md' ? 12 : 10;

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium border ${c.bg} ${c.border} ${c.text} ${sizeClasses[size]}`}
      title={`Safety Score: ${score}/100 — ${status}`}
    >
      <Icon size={iconSize} />
      <span>{c.label}</span>
      {showScore && (
        <span className="opacity-70 font-mono">{score}</span>
      )}
    </div>
  );
};

export default SafetyBadge;
