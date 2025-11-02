interface EfficiencyGaugeProps {
  percentage: number;
}

export const EfficiencyGauge = ({ percentage }: EfficiencyGaugeProps) => {
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Background ring */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="hsl(var(--mint) / 0.1)"
          strokeWidth="20"
        />
        
        {/* Progress ring with gradient */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--mint))" />
            <stop offset="100%" stopColor="hsl(var(--sky))" />
          </linearGradient>
          <filter id="gaugeShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="hsl(var(--mint))" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter="url(#gaugeShadow)"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-6xl font-bold text-foreground">{percentage}%</div>
        <div className="text-sm text-muted-foreground mt-1">of tasks completed</div>
      </div>
    </div>
  );
};
