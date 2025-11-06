import { useTheme } from '@/contexts/ThemeContext';
import { Lightbulb } from 'lucide-react';

interface StayFocusedSectionProps {
  currentTask: string;
  progress: number;
  goalTime: number;
}

export const StayFocusedSection = ({ currentTask, progress, goalTime }: StayFocusedSectionProps) => {
  const { theme } = useTheme();

  const getMotivationalMessage = (): { title: string; message: string } => {
    if (progress >= 100) {
      return {
        title: "🎉 Goal Achieved!",
        message: "Congratulations! You've hit your time goal. Consider taking a well-deserved break or extending your session."
      };
    } else if (progress >= 75) {
      return {
        title: "🔥 Almost There!",
        message: `You're doing amazing! Just a little more to reach your goal. Keep going!`
      };
    } else if (progress >= 50) {
      return {
        title: "💪 Halfway There!",
        message: `Great progress! You're halfway to your goal. Stay focused and you'll crush it.`
      };
    } else if (progress >= 25) {
      return {
        title: "⚡ Great Start!",
        message: `You're building momentum! Keep going and you'll hit your ${formatTime(goalTime)} goal.`
      };
    } else {
      return {
        title: "🚀 Let's Do This!",
        message: `You've got this! Every minute counts toward your ${formatTime(goalTime)} goal.`
      };
    }
  };

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const { title, message } = getMotivationalMessage();

  return (
    <div className={`rounded-2xl p-6 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-sky-500/10 to-mint-500/10 border border-border'
        : 'bg-gradient-to-br from-sky-50 to-mint-50 border border-gray-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className={`p-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-sky-500/20 text-sky-400'
              : 'bg-sky-100 text-sky-600'
          }`}>
            <Lightbulb className="w-5 h-5" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <h4 className={`font-semibold ${
            theme === 'dark' ? 'text-foreground' : 'text-gray-900'
          }`}>
            {title}
          </h4>
          <p className={`text-sm leading-relaxed ${
            theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
          }`}>
            {message}
          </p>
          <div className={`text-xs italic ${
            theme === 'dark' ? 'text-muted-foreground/70' : 'text-gray-500'
          }`}>
            Remember: Work until the task is done. Your future self will thank you.
          </div>
        </div>
      </div>
    </div>
  );
};