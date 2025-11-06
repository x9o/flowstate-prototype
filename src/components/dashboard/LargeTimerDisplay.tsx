import { useTheme } from '@/contexts/ThemeContext';
import { Clock } from 'lucide-react';

interface LargeTimerDisplayProps {
  sessionTime: number; // in milliseconds
}

export const LargeTimerDisplay = ({ sessionTime }: LargeTimerDisplayProps) => {
  const { theme } = useTheme();

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`rounded-2xl p-8 text-center ${
      theme === 'dark'
        ? 'bg-card border border-border'
        : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      <div className="space-y-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
          theme === 'dark'
            ? 'bg-muted'
            : 'bg-gray-100'
        }`}>
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Time Focused</span>
        </div>
        <div className={`text-5xl font-mono font-bold ${
          theme === 'dark' ? 'text-foreground' : 'text-gray-900'
        }`}>
          {formatTime(sessionTime)}
        </div>
      </div>
    </div>
  );
};