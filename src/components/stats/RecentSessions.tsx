import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Calendar, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { type AnalyticsData, type SessionHistoryEntry } from '@/services/AnalyticsService';

interface RecentSessionsProps {
  analyticsData: AnalyticsData;
  timeFilter: 'today' | 'week' | 'month' | 'all';
}

interface ExpandedSession extends SessionHistoryEntry {
  efficiency?: number;
  dateObj: Date;
  formattedDate: string;
  timeAgo: string;
}

export function RecentSessions({ analyticsData, timeFilter }: RecentSessionsProps) {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const sessions = useMemo(() => {
    // Create a simple array of sessions without complex calculations
    const processedSessions: ExpandedSession[] = analyticsData.sessionHistory
      .map(session => {
        const dateObj = new Date(session.date);
        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let timeAgo: string;
        if (diffDays === 0) {
          timeAgo = 'Today';
        } else if (diffDays === 1) {
          timeAgo = 'Yesterday';
        } else if (diffDays < 7) {
          timeAgo = `${diffDays} days ago`;
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          timeAgo = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else {
          const months = Math.floor(diffDays / 30);
          timeAgo = `${months} month${months > 1 ? 's' : ''} ago`;
        }

        const formattedDate = dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });

        // Simple efficiency calculation
        const efficiency = session.focusTimeMs > 0 ?
          Math.max(0, Math.min(100, 100 - (session.blocksCount * 10))) : 0;

        return {
          ...session,
          efficiency,
          dateObj,
          formattedDate,
          timeAgo
        };
      });

    // Filter based on time filter
    return processedSessions.filter(session => {
      const sessionDate = session.dateObj;
      const now = new Date();

      switch (timeFilter) {
        case 'today':
          return sessionDate.toDateString() === now.toDateString();
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return sessionDate >= weekAgo;
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return sessionDate >= monthAgo;
        }
        case 'all':
        default:
          return true;
      }
    }).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [analyticsData.sessionHistory, timeFilter]);

  const toggleSessionExpansion = (sessionKey: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionKey)) {
      newExpanded.delete(sessionKey);
    } else {
      newExpanded.add(sessionKey);
    }
    setExpandedSessions(newExpanded);
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getEfficiencyColor = (efficiency?: number) => {
    if (!efficiency) return 'text-muted-foreground';
    if (efficiency >= 80) return 'text-mint';
    if (efficiency >= 60) return 'text-sky';
    if (efficiency >= 40) return 'text-peach';
    return 'text-red-500';
  };

  const getEfficiencyBgColor = (efficiency?: number) => {
    if (!efficiency) return 'bg-muted';
    if (efficiency >= 80) return 'bg-mint/10 text-mint';
    if (efficiency >= 60) return 'bg-sky/10 text-sky';
    if (efficiency >= 40) return 'bg-peach/10 text-peach';
    return 'bg-red-500/10 text-red-500';
  };

  if (sessions.length === 0) {
    return (
      <Card className="bg-background/40 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent sessions found for the selected period.</p>
            <p className="text-sm">Complete some focus sessions to see your history here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/40 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo" />
            Recent Sessions
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session, index) => {
            const sessionKey = `${session.date}-${index}`;
            const isExpanded = expandedSessions.has(sessionKey);

            return (
              <div
                key={sessionKey}
                className="border border-border/50 rounded-lg overflow-hidden hover:border-border transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="font-medium">{session.formattedDate}</div>
                        <div className="text-sm text-muted-foreground">{session.timeAgo}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatDuration(session.focusTimeMs)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{session.blocksCount}</span>
                          <span className="text-muted-foreground">blocks</span>
                        </div>

                        <Badge variant="secondary" className={getEfficiencyBgColor(session.efficiency)}>
                          {session.efficiency}% efficient
                        </Badge>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSessionExpansion(sessionKey)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Top Applications</h4>
                          <div className="space-y-2">
                            {session.topApps.slice(0, 5).map((app, appIndex) => (
                              <div key={appIndex} className="flex items-center justify-between text-sm">
                                <span className="truncate flex-1">{app.app}</span>
                                <span className="text-muted-foreground ml-2">{formatDuration(app.timeMs)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Tasks Completed</h4>
                          {session.tasksCompleted.length > 0 ? (
                            <div className="space-y-1">
                              {session.tasksCompleted.slice(0, 3).map((task, taskIndex) => (
                                <div key={taskIndex} className="text-sm text-muted-foreground">
                                  • {task}
                                </div>
                              ))}
                              {session.tasksCompleted.length > 3 && (
                                <div className="text-sm text-muted-foreground">
                                  +{session.tasksCompleted.length - 3} more tasks
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No tasks recorded</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Session ID:</span>
                          <span className="font-mono text-xs">{session.date.replace(/-/g, '')}</span>
                        </div>
                        <div className={`font-medium ${getEfficiencyColor(session.efficiency)}`}>
                          {session.efficiency}% efficiency score
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sessions.length > 5 && (
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <Button variant="outline" size="sm" className="text-xs">
              View all sessions ({sessions.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}