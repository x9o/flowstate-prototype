import React, { useEffect, useState } from 'react';
import { Clock, Activity, Shield } from 'lucide-react';

interface CurrentSessionCardProps {
  goals: string[];
  sessionStartTime: number | null;
  totalChecks: number;
  blockedAttempts: number;
  onStop: () => void;
}

export const CurrentSessionCard: React.FC<CurrentSessionCardProps> = ({
  goals,
  sessionStartTime,
  totalChecks,
  blockedAttempts,
  onStop
}) => {
  const [sessionDuration, setSessionDuration] = useState('00:00');

  useEffect(() => {
    if (!sessionStartTime) return;

    const updateDuration = () => {
      const elapsed = Date.now() - sessionStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setSessionDuration(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  return (
    <div className="bg-gradient-to-br from-mint/10 via-background/40 to-sky/10 backdrop-blur-sm border border-mint/30 rounded-xl p-6 col-span-2">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Active Session</h3>
          <p className="text-sm text-muted-foreground truncate max-w-md">
            {goals[0] || 'Focused work'}
          </p>
        </div>
        <button
          onClick={onStop}
          className="px-4 py-2 bg-mint/20 hover:bg-mint/30 text-mint border border-mint/30 rounded-lg text-sm font-medium transition-all duration-200"
        >
          Stop
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-mint/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-mint" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-lg font-bold text-foreground">{sessionDuration}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-mint/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-mint" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Checks</p>
            <p className="text-lg font-bold text-foreground">{totalChecks}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-mint/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-mint" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Blocks</p>
            <p className="text-lg font-bold text-foreground">{blockedAttempts}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
