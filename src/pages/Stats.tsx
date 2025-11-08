import React, { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, TrendingUp, Target, ArrowLeft } from 'lucide-react';
import { analyticsService, type AnalyticsData } from '@/services/AnalyticsService';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { StatsSummary } from '@/components/stats/StatsSummary';
import { BlockedAppsChart } from '@/components/stats/BlockedAppsChart';
import { UsageTimeChart } from '@/components/stats/UsageTimeChart';
import { RecentSessions } from '@/components/stats/RecentSessions';
import { TimeFilter } from '@/components/stats/TimeFilter';

export default function Stats() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAnalytics = () => {
      try {
        const data = analyticsService.getAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Statistics</h1>
            <p className="text-muted-foreground">Track your productivity patterns and focus habits</p>
          </div>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-muted rounded-xl" />
              <div className="h-96 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!analyticsData) {
    return (
      <PageTransition>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
            <p className="text-muted-foreground">Start some focus sessions to see your statistics here.</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Header with return button */}
          <header className={`h-16 border-b flex items-center justify-between px-6 ${
            theme === 'dark' ? 'bg-card border-border' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'text-mint hover:text-white hover:bg-mint/20'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold">Statistics</h1>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {/* Subheader */}
              <div className="mb-8">
                <p className="text-muted-foreground">Track your productivity patterns and focus habits</p>
              </div>

        {/* Summary Cards */}
        <StatsSummary analyticsData={analyticsData} />

        {/* Time Filter */}
        <div className="mb-8">
          <TimeFilter value={timeFilter} onChange={setTimeFilter} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Most Blocked Windows */}
          <BlockedAppsChart
            analyticsData={analyticsData}
            timeFilter={timeFilter}
          />

          {/* Most Used Windows by Time */}
          <UsageTimeChart
            analyticsData={analyticsData}
            timeFilter={timeFilter}
          />
        </div>

        {/* Recent Sessions */}
        <RecentSessions
          analyticsData={analyticsData}
          timeFilter={timeFilter}
        />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}