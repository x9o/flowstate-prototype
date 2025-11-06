import React from 'react';
import { ShieldOff } from 'lucide-react';
import { BlockEvent } from '../../types/monitoring';

interface RecentBlocksCardProps {
  recentBlocks: BlockEvent[];
}

export const RecentBlocksCard: React.FC<RecentBlocksCardProps> = ({ recentBlocks }) => {
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  return (
    <div className="bg-background/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-background/60 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-peach/20 flex items-center justify-center">
          <ShieldOff className="w-5 h-5 text-peach" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Recent Blocks</h3>
      </div>

      {recentBlocks.length === 0 ? (
        <p className="text-sm text-mint text-center py-4">
          No blocks yet - you're staying focused!
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {recentBlocks.map((block, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-peach/20 flex items-center justify-center flex-shrink-0">
                <ShieldOff className="w-4 h-4 text-peach" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {block.app}
                </p>
                <p className="text-xs text-muted-foreground truncate" title={block.title}>
                  {block.title}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTime(block.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
