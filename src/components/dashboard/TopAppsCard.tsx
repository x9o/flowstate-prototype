import React from 'react';
import { Sparkles } from 'lucide-react';
import { AppCount } from '../../types/monitoring';

interface TopAppsCardProps {
  topApps: AppCount[];
  title?: string;
}

export const TopAppsCard: React.FC<TopAppsCardProps> = ({
  topApps,
  title = 'Top Productive Apps'
}) => {
  const maxCount = topApps.length > 0 ? topApps[0].count : 1;

  return (
    <div className="bg-background/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-background/60 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-mint/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-mint" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      {topApps.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No data yet
        </p>
      ) : (
        <div className="space-y-3">
          {topApps.map((app, index) => {
            const percentage = (app.count / maxCount) * 100;

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground truncate flex-1 mr-2">
                    {app.app}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {app.count} checks
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mint to-sky rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
