import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, RefreshCw, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './LoadingSpinner';
import { useRecentTasks } from '@/contexts/RecentTasksContext';
import { TaskSuggestionService } from '@/services/TaskSuggestionService';
import { cn } from '@/lib/utils';

interface SuggestedTasksProps {
  onTaskSelect?: (task: string) => void;
  className?: string;
}

export const SuggestedTasks: React.FC<SuggestedTasksProps> = ({
  onTaskSelect,
  className
}) => {
  const {
    suggestedTasks,
    isLoadingSuggestions,
    suggestionsFromCache,
    refreshSuggestions
  } = useRecentTasks();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(TaskSuggestionService.getRandomLoadingMessage());

  // Update loading message periodically for better UX
  useEffect(() => {
    if (isLoadingSuggestions) {
      const interval = setInterval(() => {
        setLoadingMessage(TaskSuggestionService.getRandomLoadingMessage());
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isLoadingSuggestions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSuggestions();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTaskSelect = (task: string) => {
    onTaskSelect?.(task);
  };

  // Loading state
  if (isLoadingSuggestions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('w-full', className)}
      >
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-mint" />
                <h3 className="text-lg font-semibold">Suggested Tasks</h3>
                <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-mint/20 to-mint/10 text-mint border border-mint/30 rounded-full">
                  PRO
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" text={loadingMessage} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Empty state - no suggestions available
  if (suggestedTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('w-full', className)}
      >
        <Card className="border-dashed opacity-60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-mint" />
                <h3 className="text-lg font-semibold">Suggested Tasks</h3>
                <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-mint/20 to-mint/10 text-mint border border-mint/30 rounded-full">
                  PRO
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 px-2"
              >
                <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              </Button>
            </div>
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No suggestions available yet.</p>
              <p className="text-xs mt-1">Complete some tasks to get personalized suggestions.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show suggested tasks
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('w-full', className)}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-mint" />
              <h3 className="text-lg font-semibold">Suggested Tasks</h3>
              <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-mint/20 to-mint/10 text-mint border border-mint/30 rounded-full">
                PRO
              </span>
              {suggestionsFromCache && (
                <span className="text-xs text-muted-foreground ml-2">(cached)</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 px-2"
              title="Get fresh suggestions"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>

          <div className="space-y-2">
            {suggestedTasks.map((task, index) => (
              <motion.div
                key={`${task}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-mint/50 hover:bg-mint/5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-mint opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm font-medium truncate">
                    {task}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTaskSelect(task)}
                  className="h-7 px-3 text-xs text-mint hover:text-mint hover:bg-mint/10 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
              </motion.div>
            ))}
          </div>

          {suggestionsFromCache && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                Suggestions based on your recent task history
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};