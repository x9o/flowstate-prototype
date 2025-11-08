import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Pause, Play, CheckCircle, Square } from 'lucide-react';

interface SessionActionButtonProps {
  type: 'pause' | 'complete' | 'end' | 'finish';
  onClick: () => void;
  isPaused?: boolean;
}

export const SessionActionButton = ({ type, onClick, isPaused = false }: SessionActionButtonProps) => {
  const { theme } = useTheme();

  const getButtonConfig = () => {
    switch (type) {
      case 'pause':
        return {
          icon: isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />,
          label: isPaused ? 'Resume' : 'Pause',
          className: isPaused
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
        };
      case 'complete':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          label: 'Task Complete',
          className: 'bg-green-500 hover:bg-green-600 text-white'
        };
      case 'finish':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          label: 'FINISH',
          className: 'bg-green-500 hover:bg-green-600 text-white'
        };
      case 'end':
        return {
          icon: <Square className="w-5 h-5" />,
          label: 'End Session',
          className: 'bg-red-500 hover:bg-red-600 text-white'
        };
    }
  };

  const config = getButtonConfig();

  return (
    <Button
      onClick={onClick}
      className={`h-12 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02] ${config.className}`}
    >
      <span className="flex items-center gap-2">
        {config.icon}
        {config.label}
      </span>
    </Button>
  );
};