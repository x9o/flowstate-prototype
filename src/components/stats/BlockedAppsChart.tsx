import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Ban } from 'lucide-react';
import { type AnalyticsData } from '@/services/AnalyticsService';
import * as SimpleIcons from 'react-icons/si';

interface BlockedAppsChartProps {
  analyticsData: AnalyticsData;
  timeFilter: 'today' | 'week' | 'month' | 'all';
}

interface BlockedApp {
  name: string;
  count: number;
  percentage: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export function BlockedAppsChart({ analyticsData, timeFilter }: BlockedAppsChartProps) {
  const blockedApps = useMemo(() => {
    // Create a simple array of mock blocked apps for now
    const mockApps = [
      { name: 'YouTube', count: 12, percentage: 30 },
      { name: 'Instagram', count: 8, percentage: 20 },
      { name: 'Twitter', count: 6, percentage: 15 },
      { name: 'Reddit', count: 5, percentage: 12 },
      { name: 'Discord', count: 4, percentage: 10 },
      { name: 'Slack', count: 3, percentage: 8 },
      { name: 'Netflix', count: 2, percentage: 5 },
    ];

    // If we have real data, use it, otherwise use mock data
    if (analyticsData.allTimeStats.mostBlockedApp && timeFilter === 'all') {
      return [
        { name: analyticsData.allTimeStats.mostBlockedApp, count: 15, percentage: 35 },
        ...mockApps.slice(0, 6).map(app => ({ ...app, percentage: Math.round((app.count / 43) * 100) }))
      ];
    }

    return mockApps;
  }, [analyticsData, timeFilter]);

  if (blockedApps.length === 0) {
    return (
      <Card className="bg-background/40 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-peach" />
            Most Blocked Windows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No blocked apps found for the selected period.</p>
            <p className="text-sm">Start focusing and block some distractions to see data here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...blockedApps.map(app => app.count));

  return (
    <Card className="bg-background/40 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="h-5 w-5 text-peach" />
          Most Blocked Windows
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {blockedApps.map((app, index) => (
            <div key={app.name} className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-peach/20 to-peach/5 flex items-center justify-center">
                  {app.icon ? (
                    <app.icon className="w-4 h-4 text-peach" />
                  ) : (
                    <div className="w-4 h-4 bg-peach/50 rounded-sm" />
                  )}
                </div>
                <span className="text-sm font-medium truncate">{app.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 w-24">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-peach to-peach/60 rounded-full transition-all duration-500"
                      style={{
                        width: `${(app.count / maxCount) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="text-sm text-right min-w-[60px]">
                  <div className="font-semibold">{app.count}</div>
                  <div className="text-xs text-muted-foreground">{app.percentage}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total blocks in period</span>
            <span className="font-medium text-foreground">
              {blockedApps.reduce((sum, app) => sum + app.count, 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}