export default function KPICard({ title, value, subtitle, icon: Icon, variant = 'default', trend }) {
  const variants = {
    default: {
      border: 'border-bg-border',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      valueColor: 'text-white',
    },
    profit: {
      border: 'border-profit/20',
      iconBg: 'bg-profit-dim',
      iconColor: 'text-profit',
      valueColor: 'text-profit',
    },
    loss: {
      border: 'border-loss/20',
      iconBg: 'bg-loss-dim',
      iconColor: 'text-loss',
      valueColor: 'text-loss',
    },
    net: {
      border: 'border-bg-border',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      valueColor: value && String(value).startsWith('-') ? 'text-loss' : 'text-profit',
    },
  };

  const v = variants[variant] || variants.default;

  return (
    <div className={`card p-5 border ${v.border} fade-in-up hover:bg-bg-hover transition-colors duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-muted text-sm font-medium">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl ${v.iconBg} flex items-center justify-center`}>
            <Icon size={16} className={v.iconColor} />
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold ${v.valueColor} font-mono tracking-tight`}>{value}</p>
      {subtitle && <p className="text-muted text-xs mt-2">{subtitle}</p>}
      {trend !== undefined && (
        <div className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-profit' : 'text-loss'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
        </div>
      )}
    </div>
  );
}
