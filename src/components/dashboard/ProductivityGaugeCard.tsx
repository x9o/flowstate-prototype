import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ProductivityGaugeCardProps {
  productiveChecks: number;
  blockedAttempts: number;
}

export const ProductivityGaugeCard: React.FC<ProductivityGaugeCardProps> = ({
  productiveChecks,
  blockedAttempts
}) => {
  const total = productiveChecks + blockedAttempts;
  const percentage = total > 0 ? Math.round((productiveChecks / total) * 100) : 0;

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-background/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-background/60 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-mint/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-mint" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Productivity Score</h3>
      </div>

      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background ring */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="hsl(var(--mint) / 0.1)"
            strokeWidth="12"
          />

          {/* Progress ring with gradient */}
          <defs>
            <linearGradient id="productivityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--mint))" />
              <stop offset="100%" stopColor="hsl(var(--sky))" />
            </linearGradient>
          </defs>

          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#productivityGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-foreground">{percentage}%</div>
          <div className="text-xs text-muted-foreground mt-1">productive</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 text-center">
        <div>
          <p className="text-2xl font-bold text-mint">{productiveChecks}</p>
          <p className="text-xs text-muted-foreground">Productive</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-peach">{blockedAttempts}</p>
          <p className="text-xs text-muted-foreground">Blocked</p>
        </div>
      </div>
    </div>
  );
};
