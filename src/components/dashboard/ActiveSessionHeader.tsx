import { useTheme } from '@/contexts/ThemeContext';

export const ActiveSessionHeader = () => {
  const { theme } = useTheme();

  return (
    <div className="text-center mb-8">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
        theme === 'dark'
          ? 'bg-green-900/30 border border-green-700/50'
          : 'bg-green-50 border border-green-200'
      }`}>
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className={`font-semibold ${
          theme === 'dark' ? 'text-green-400' : 'text-green-700'
        }`}>
          SESSION ACTIVE
        </span>
      </div>
    </div>
  );
};