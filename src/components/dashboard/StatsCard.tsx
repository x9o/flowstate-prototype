import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  iconColor = 'text-mint',
  className = ''
}) => {
  const getBgGradient = (color: string) => {
    const colorMap: { [key: string]: { from: string; to: string } } = {
      'text-mint': { from: 'from-mint/20', to: 'to-mint/5' },
      'text-sky': { from: 'from-sky/20', to: 'to-sky/5' },
      'text-peach': { from: 'from-peach/20', to: 'to-peach/5' },
      'text-indigo': { from: 'from-indigo/20', to: 'to-indigo/5' },
      'text-lavender': { from: 'from-lavender/20', to: 'to-lavender/5' },
      'text-orange-500': { from: 'from-orange-500/20', to: 'to-orange-500/5' },
      'text-blue-500': { from: 'from-blue-500/20', to: 'to-blue-500/5' },
      'text-green-500': { from: 'from-green-500/20', to: 'to-green-500/5' },
      'text-red-500': { from: 'from-red-500/20', to: 'to-red-500/5' }
    };
    return colorMap[color] || colorMap['text-mint'];
  };

  const gradient = getBgGradient(iconColor);

  return (
    <div className={`bg-background/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-background/60 transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        {trend && (
          <div className={`px-2 py-1 rounded-md text-xs font-medium ${
            trend.isPositive ? 'bg-mint/20 text-mint' : 'bg-peach/20 text-peach'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </div>
  );
};
