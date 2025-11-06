import { useTheme } from '@/contexts/ThemeContext';
import { Shield } from 'lucide-react';

interface BlockedItem {
  activity: string;
  timestamp: number;
}

interface RecentlyBlockedListProps {
  blockedItems: BlockedItem[];
}

export const RecentlyBlockedList = ({ blockedItems }: RecentlyBlockedListProps) => {
  const { theme } = useTheme();

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatActivity = (activity: string): string => {
    // Clean up the activity display
    if (activity.length > 40) {
      return activity.substring(0, 37) + '...';
    }
    return activity;
  };

  return (
    <div className={`rounded-2xl p-6 ${
      theme === 'dark'
        ? 'bg-card border border-border'
        : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-peach" />
        <h3 className="text-lg font-semibold">🚫 Recently Blocked</h3>
      </div>

      {blockedItems.length === 0 ? (
        <div className={`text-center py-6 ${
          theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
        }`}>
          <p className="text-sm">No distractions blocked yet. Keep up the great focus!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blockedItems.slice(0, 5).map((item, index) => (
            <div
              key={`${item.timestamp}-${index}`}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-muted/50 hover:bg-muted'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-900'
                }`}>
                  {formatActivity(item.activity)}
                </p>
              </div>
              <span className={`text-xs ml-3 whitespace-nowrap ${
                theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'
              }`}>
                {formatTimeAgo(item.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};