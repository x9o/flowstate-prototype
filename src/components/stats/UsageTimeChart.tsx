import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Monitor, TrendingUp } from 'lucide-react';
import { type AnalyticsData } from '@/services/AnalyticsService';
import * as SimpleIcons from 'react-icons/si';

interface UsageTimeChartProps {
  analyticsData: AnalyticsData;
  timeFilter: 'today' | 'week' | 'month' | 'all';
}

interface AppUsage {
  name: string;
  timeMs: number;
  timeFormatted: string;
  percentage: number;
  category: 'productive' | 'neutral' | 'distracting';
  icon?: React.ComponentType<{ className?: string }>;
}

export function UsageTimeChart({ analyticsData, timeFilter }: UsageTimeChartProps) {
  const appUsage = useMemo(() => {
    // Create a simple array of mock app usage for now
    const mockApps = [
      { name: 'Visual Studio Code', timeMs: 1800000, timeFormatted: '30m', percentage: 30, category: 'productive' as const },
      { name: 'Notion', timeMs: 900000, timeFormatted: '15m', percentage: 15, category: 'productive' as const },
      { name: 'Figma', timeMs: 600000, timeFormatted: '10m', percentage: 10, category: 'productive' as const },
      { name: 'Chrome', timeMs: 1200000, timeFormatted: '20m', percentage: 20, category: 'neutral' as const },
      { name: 'Slack', timeMs: 300000, timeFormatted: '5m', percentage: 5, category: 'neutral' as const },
      { name: 'Spotify', timeMs: 180000, timeFormatted: '3m', percentage: 3, category: 'neutral' as const },
      { name: 'Discord', timeMs: 120000, timeFormatted: '2m', percentage: 2, category: 'neutral' as const },
    ];

    // If we have real data, use it, otherwise use mock data
    if (analyticsData.sessionHistory.length > 0 && timeFilter === 'all') {
      // Use the real top apps from the most recent session
      const recentSession = analyticsData.sessionHistory[analyticsData.sessionHistory.length - 1];
      if (recentSession && recentSession.topApps.length > 0) {
        const totalTime = recentSession.topApps.reduce((sum, app) => sum + app.timeMs, 0);
        return recentSession.topApps.map(app => ({
          name: app.app,
          timeMs: app.timeMs,
          timeFormatted: formatDuration(app.timeMs),
          percentage: totalTime > 0 ? Math.round((app.timeMs / totalTime) * 100) : 0,
          category: 'neutral' as const // Default to neutral for now
        }));
      }
    }

    return mockApps;
  }, [analyticsData, timeFilter]);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getCategoryColor = (category: 'productive' | 'neutral' | 'distracting') => {
    switch (category) {
      case 'productive':
        return 'from-mint to-mint/60';
      case 'neutral':
        return 'from-sky to-sky/60';
      case 'distracting':
        return 'from-peach to-peach/60';
      default:
        return 'from-muted to-muted/60';
    }
  };

  const getCategoryBgColor = (category: 'productive' | 'neutral' | 'distracting') => {
    switch (category) {
      case 'productive':
        return 'bg-mint/20';
      case 'neutral':
        return 'bg-sky/20';
      case 'distracting':
        return 'bg-peach/20';
      default:
        return 'bg-muted/20';
    }
  };

  const totalProductiveTime = appUsage
    .filter(app => app.category === 'productive')
    .reduce((sum, app) => sum + app.timeMs, 0);

  const totalNeutralTime = appUsage
    .filter(app => app.category === 'neutral')
    .reduce((sum, app) => sum + app.timeMs, 0);

  const totalTime = appUsage.reduce((sum, app) => sum + app.timeMs, 0);

  if (appUsage.length === 0) {
    return (
      <Card className="bg-background/40 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-mint" />
            Most Used Windows by Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No app usage data found for the selected period.</p>
            <p className="text-sm">Complete some focus sessions to see your usage patterns here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxTime = Math.max(...appUsage.map(app => app.timeMs));

  return (
    <Card className="bg-background/40 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-mint" />
          Most Used Windows by Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Category Summary */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-mint" />
            <span className="text-sm text-muted-foreground">Productive</span>
            <span className="text-sm font-medium">{formatDuration(totalProductiveTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky" />
            <span className="text-sm text-muted-foreground">Neutral</span>
            <span className="text-sm font-medium">{formatDuration(totalNeutralTime)}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-sm font-medium">{formatDuration(totalTime)}</span>
          </div>
        </div>

        {/* App Usage List */}
        <div className="space-y-4">
          {appUsage.map((app, index) => (
            <div key={app.name} className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${getCategoryBgColor(app.category)} flex items-center justify-center`}>
                  {app.icon ? (
                    <app.icon className="w-4 h-4" />
                  ) : (
                    <Monitor className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{app.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{app.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 w-24">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getCategoryColor(app.category)} rounded-full transition-all duration-500`}
                      style={{
                        width: `${(app.timeMs / maxTime) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="text-sm text-right min-w-[80px]">
                  <div className="font-semibold">{app.timeFormatted}</div>
                  <div className="text-xs text-muted-foreground">{app.percentage}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total tracked time</span>
            <span className="font-medium text-foreground">
              {formatDuration(totalTime)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}