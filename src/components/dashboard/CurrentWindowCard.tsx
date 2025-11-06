import React from 'react';
import { Monitor, Layers } from 'lucide-react';
import { WindowInfo } from '../../types/monitoring';

interface CurrentWindowCardProps {
  currentWindow: WindowInfo | null;
}

export const CurrentWindowCard: React.FC<CurrentWindowCardProps> = ({ currentWindow }) => {
  if (!currentWindow) {
    return (
      <div className="bg-background/40 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-sky/20 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-sky" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Current Activity</h3>
        </div>
        <p className="text-sm text-muted-foreground">No active window detected</p>
      </div>
    );
  }

  return (
    <div className="bg-background/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-background/60 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-sky/20 flex items-center justify-center">
          <Monitor className="w-5 h-5 text-sky" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Current Activity</h3>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Application</p>
          <p className="text-sm font-medium text-foreground truncate">{currentWindow.app}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Window Title</p>
          <p className="text-sm font-medium text-foreground truncate" title={currentWindow.title}>
            {currentWindow.title}
          </p>
        </div>

        {currentWindow.category && (
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {currentWindow.category}
            </span>
          </div>
        )}

        {currentWindow.url && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">URL</p>
            <p className="text-xs font-mono text-foreground/70 truncate" title={currentWindow.url}>
              {currentWindow.url}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
