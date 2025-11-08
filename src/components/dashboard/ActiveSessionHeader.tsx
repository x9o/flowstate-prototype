import { useTheme } from '@/contexts/ThemeContext';
import { useMonitoring } from '@/contexts/MonitoringContext';

export const ActiveSessionHeader = () => {
  const { theme } = useTheme();
  const { isPaused } = useMonitoring();

  return (
    <div className="text-center mb-8">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
        isPaused
          ? theme === 'dark'
            ? 'bg-yellow-900/30 border border-yellow-700/50'
            : 'bg-yellow-50 border border-yellow-200'
          : theme === 'dark'
            ? 'bg-green-900/30 border border-green-700/50'
            : 'bg-green-50 border border-green-200'
      }`}>
        <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
        <span className={`font-semibold ${
          isPaused
            ? theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'
            : theme === 'dark' ? 'text-green-400' : 'text-green-700'
        }`}>
          {isPaused ? 'SESSION PAUSED' : 'SESSION ACTIVE'}
        </span>
      </div>
    </div>
  );
};