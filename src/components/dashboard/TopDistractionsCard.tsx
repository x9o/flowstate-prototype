import React from 'react';
import { AlertCircle } from 'lucide-react';
import { AppCount } from '../../types/monitoring';

interface TopDistractionsCardProps {
  topBlockedApps: AppCount[];
}

export const TopDistractionsCard: React.FC<TopDistractionsCardProps> = ({
  topBlockedApps
}) => {
  const maxCount = topBlockedApps.length > 0 ? topBlockedApps[0].count : 1;

  return (
    <div className="bg-background/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-background/60 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-peach/20 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-peach" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Top Distractions</h3>
      </div>

      {topBlockedApps.length === 0 ? (
        <p className="text-sm text-mint text-center py-4">
          No distractions blocked yet!
        </p>
      ) : (
        <div className="space-y-3">
          {topBlockedApps.map((app, index) => {
            const percentage = (app.count / maxCount) * 100;

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground truncate flex-1 mr-2">
                    {app.app}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {app.count} {app.count === 1 ? 'block' : 'blocks'}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-peach to-orange-400 rounded-full transition-all duration-500"
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
