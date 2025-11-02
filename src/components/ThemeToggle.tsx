import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`h-8 w-12 flex items-center justify-center transition-all duration-200 ${className} ${
        theme === 'dark'
          ? 'text-purple-300 hover:text-white hover:bg-purple-900'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon size={16} className="transition-all duration-200" />
      ) : (
        <Sun size={16} className="transition-all duration-200" />
      )}
    </button>
  );
};

export default ThemeToggle;