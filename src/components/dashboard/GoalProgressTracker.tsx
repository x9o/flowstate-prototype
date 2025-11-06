import { useTheme } from '@/contexts/ThemeContext';
import { Target } from 'lucide-react';

interface GoalProgressTrackerProps {
  currentTime: number; // in milliseconds
  goalTime: number; // in milliseconds, default 2 hours
}

export const GoalProgressTracker = ({ currentTime, goalTime = 2 * 60 * 60 * 1000 }: GoalProgressTrackerProps) => {
  const { theme } = useTheme();

  const progress = Math.min((currentTime / goalTime) * 100, 100);
  const remainingTime = Math.max(goalTime - currentTime, 0);

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className={`rounded-xl p-4 text-center ${
      theme === 'dark'
        ? 'bg-card border border-border'
        : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Target className="w-5 h-5 text-mint" />
        <span className="text-sm font-medium text-muted-foreground">Goal: {formatTime(goalTime)}</span>
      </div>
      <div className={`text-2xl font-bold mb-2 ${
        theme === 'dark' ? 'text-foreground' : 'text-gray-900'
      }`}>
        {progress.toFixed(0)}%
      </div>
      <div className={`text-sm ${
        theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
      }`}>
        {progress >= 100
          ? 'Goal achieved! 🎉'
          : `${formatTime(remainingTime)} remaining`
        }
      </div>
    </div>
  );
};