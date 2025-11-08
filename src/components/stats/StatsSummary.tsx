import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { type AnalyticsData } from '@/services/AnalyticsService';

interface StatsSummaryProps {
  analyticsData: AnalyticsData;
}

export function StatsSummary({ analyticsData }: StatsSummaryProps) {
  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const calculateAverageSessionTime = () => {
    if (analyticsData.allTimeStats.totalSessions === 0) return '0m';
    const averageMs = analyticsData.allTimeStats.totalFocusTimeMs / analyticsData.allTimeStats.totalSessions;
    return formatDuration(averageMs);
  };

  const calculateBlockRate = () => {
    if (analyticsData.allTimeStats.totalSessions === 0) return '0%';
    const blockRate = (analyticsData.allTimeStats.totalBlocks / analyticsData.allTimeStats.totalSessions) * 100;
    return `${Math.round(blockRate)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-mint/20 to-mint/5 border-mint/20 hover:bg-gradient-to-br hover:from-mint/25 hover:to-mint/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
          <Clock className="h-4 w-4 text-mint" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDuration(analyticsData.totalFocusTimeMs)}
          </div>
          <p className="text-xs text-muted-foreground">
            All time tracked
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-indigo/20 to-indigo/5 border-indigo/20 hover:bg-gradient-to-br hover:from-indigo/25 hover:to-indigo/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <TrendingUp className="h-4 w-4 text-indigo" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData.streakDays}
          </div>
          <p className="text-xs text-muted-foreground">
            Days in a row
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-peach/20 to-peach/5 border-peach/20 hover:bg-gradient-to-br hover:from-peach/25 hover:to-peach/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <Target className="h-4 w-4 text-peach" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData.allTimeStats.totalSessions}
          </div>
          <p className="text-xs text-muted-foreground">
            Avg: {calculateAverageSessionTime()} per session
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-sky/20 to-sky/5 border-sky/20 hover:bg-gradient-to-br hover:from-sky/25 hover:to-sky/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Blocks</CardTitle>
          <BarChart3 className="h-4 w-4 text-sky" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData.allTimeStats.totalBlocks}
          </div>
          <p className="text-xs text-muted-foreground">
            {calculateBlockRate()} of sessions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}