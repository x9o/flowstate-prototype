import React from 'react';
import { Calendar } from 'lucide-react';
import { WeeklyActivity } from '../WeeklyActivity';

interface WeeklyActivityCardProps {
  weeklyData: number[]; // 7 days of focus time in milliseconds
}

export const WeeklyActivityCard: React.FC<WeeklyActivityCardProps> = ({ weeklyData }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get the correct day labels relative to today
  const today = new Date().getDay();
  const dayLabels = [];
  for (let i = 0; i < 7; i++) {
    const dayIndex = (today - 6 + i + 7) % 7;
    dayLabels.push(days[dayIndex]);
  }

  // Convert milliseconds to minutes for display
  const chartData = weeklyData.map((ms, index) => ({
    month: dayLabels[index],
    value: Math.round(ms / 60000), // Convert to minutes
    color: 'hsl(var(--mint))'
  }));

  return (
    <div className="bg-background/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-background/60 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-lavender/20 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-lavender" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Weekly Activity</h3>
          <p className="text-xs text-muted-foreground">Last 7 days of focus time</p>
        </div>
      </div>

      <WeeklyActivity data={chartData} />
    </div>
  );
};
