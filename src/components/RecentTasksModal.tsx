import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Clock, Target, Trash2, Search, Filter, TrendingUp, Calendar, Tag } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useRecentTasks, formatTimeAgo, formatEstimatedTime, RecentTask } from '@/contexts/RecentTasksContext';
import { Button } from '@/components/ui/button';

interface RecentTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskSelect: (task: RecentTask) => void;
}

const taskColors = {
  mint: 'bg-mint/10 text-mint border-mint/20',
  indigo: 'bg-indigo/10 text-indigo border-indigo/20',
  peach: 'bg-peach/10 text-peach border-peach/20',
  sky: 'bg-sky/10 text-sky border-sky/20',
  lavender: 'bg-lavender/10 text-lavender border-lavender/20'
};

export function RecentTasksModal({ isOpen, onClose, onTaskSelect }: RecentTasksModalProps) {
  const { theme } = useTheme();
  const { recentTasks, removeRecentTask, clearRecentTasks } = useRecentTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'usage' | 'time'>('recent');

  // Filter and sort tasks
  const filteredTasks = recentTasks
    .filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'time':
          return (b.estimatedTime || 0) - (a.estimatedTime || 0);
        case 'recent':
        default:
          return b.lastUsed - a.lastUsed;
      }
    });

  const handleTaskSelect = (task: RecentTask) => {
    onTaskSelect(task);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden ${
            theme === 'dark' ? 'bg-card border border-border' : 'bg-white border border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${
            theme === 'dark' ? 'border-border' : 'border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Recent Tasks</h2>
                <p className="text-muted-foreground">
                  {recentTasks.length > 0
                    ? `Continue working on your recent tasks (${recentTasks.length} total)`
                    : 'No recent tasks yet. Complete some tasks to see them here!'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filters */}
            {recentTasks.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-muted border-border focus:border-mint'
                        : 'bg-gray-50 border-gray-200 focus:border-mint'
                    } focus:outline-none focus:ring-2 focus:ring-mint/20`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={sortBy === 'recent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('recent')}
                    className="text-xs"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Recent
                  </Button>
                  <Button
                    variant={sortBy === 'usage' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('usage')}
                    className="text-xs"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Most Used
                  </Button>
                  <Button
                    variant={sortBy === 'time' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('time')}
                    className="text-xs"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Time
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Task List */}
          <div className="overflow-y-auto max-h-96">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">
                  {recentTasks.length === 0 ? 'No Recent Tasks' : 'No Matching Tasks'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {recentTasks.length === 0
                    ? 'Complete some focus sessions to build your recent tasks history.'
                    : 'Try adjusting your search or filters to find what you\'re looking for.'
                  }
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group p-4 rounded-xl border-2 transition-all hover:scale-[1.02] cursor-pointer ${
                      theme === 'dark'
                        ? 'border-border hover:border-mint hover:bg-muted/30'
                        : 'border-gray-200 hover:border-mint hover:bg-gray-50'
                    }`}
                    onClick={() => handleTaskSelect(task)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-2 h-2 rounded-full ${
                            task.color === 'mint' ? 'bg-mint' :
                            task.color === 'indigo' ? 'bg-indigo' :
                            task.color === 'peach' ? 'bg-peach' :
                            task.color === 'sky' ? 'bg-sky' :
                            'bg-lavender'
                          }`} />
                          <h3 className="font-semibold text-foreground truncate pr-2">
                            {task.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(task.lastUsed)}
                          </span>
                          {task.estimatedTime && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {formatEstimatedTime(task.estimatedTime)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {task.usageCount} uses
                          </span>
                        </div>

                        {task.category && (
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${taskColors[task.color]}`}>
                            <Tag className="w-3 h-3" />
                            {task.category}
                          </div>
                        )}

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            {task.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className={`px-2 py-1 rounded-full text-xs ${taskColors[task.color]}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskSelect(task);
                          }}
                          className={`p-2 rounded-lg transition-all ${
                            theme === 'dark'
                              ? 'bg-mint hover:bg-mint/80 text-mint-foreground'
                              : 'bg-mint hover:bg-mint/90 text-white'
                          }`}
                        >
                          <Play className="w-4 h-4" fill="currentColor" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentTask(task.id);
                          }}
                          className={`p-2 rounded-lg transition-all ${
                            theme === 'dark'
                              ? 'hover:bg-red-500/20 text-red-400'
                              : 'hover:bg-red-50 text-red-500'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentTasks.length > 0 && (
            <div className={`p-4 border-t ${
              theme === 'dark' ? 'border-border' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredTasks.length} of {recentTasks.length} tasks shown
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all recent tasks?')) {
                      clearRecentTasks();
                    }
                  }}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}