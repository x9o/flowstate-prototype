import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Clock, Target, Shield, TrendingUp, BarChart3, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface SessionStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    duration: number;
    blockedAttempts: number;
    totalChecks: number;
    goals: string[];
    blockedApps: Array<{ appName: string; windowTitle: string; count: number }>;
    productiveApps: Array<{ appName: string; windowTitle: string; count: number }>;
  };
}

export const SessionStatsModal: React.FC<SessionStatsModalProps> = ({
  isOpen,
  onClose,
  sessionData
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getEfficiency = () => {
    if (sessionData.totalChecks === 0) return 100;
    return Math.round(((sessionData.totalChecks - sessionData.blockedAttempts) / sessionData.totalChecks) * 100);
  };

  const getTopBlockedApps = () => {
    return sessionData.blockedApps
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getTopProductiveApps = () => {
    return sessionData.productiveApps
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const efficiency = getEfficiency();
  const topBlocked = getTopBlockedApps();
  const topProductive = getTopProductiveApps();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
          theme === 'dark' ? 'bg-card border border-border' : 'bg-white border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Session Complete!</h2>
              <p className="text-sm text-muted-foreground">
                Great job staying focused on your goals
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-muted text-muted-foreground hover:text-foreground'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
          {/* Goals */}
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-muted/30' : 'bg-blue-50 border border-blue-200'
          }`}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Focus Goals
            </h3>
            <div className="flex flex-wrap gap-2">
              {sessionData.goals.map((goal, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl text-center ${
              theme === 'dark' ? 'bg-muted/30' : 'bg-gray-50'
            }`}>
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{formatTime(sessionData.duration)}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>

            <div className={`p-4 rounded-xl text-center ${
              theme === 'dark' ? 'bg-muted/30' : 'bg-gray-50'
            }`}>
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{sessionData.totalChecks}</div>
              <div className="text-xs text-muted-foreground">Total Checks</div>
            </div>

            <div className={`p-4 rounded-xl text-center ${
              theme === 'dark' ? 'bg-muted/30' : 'bg-gray-50'
            }`}>
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{sessionData.blockedAttempts}</div>
              <div className="text-xs text-muted-foreground">Blocked</div>
            </div>

            <div className={`p-4 rounded-xl text-center ${
              theme === 'dark' ? 'bg-muted/30' : 'bg-gray-50'
            }`}>
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{efficiency}%</div>
              <div className="text-xs text-muted-foreground">Efficiency</div>
            </div>
          </div>

          {/* Top Blocked Apps */}
          {topBlocked.length > 0 && (
            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Top Blocked Activities
              </h3>
              <div className="space-y-2">
                {topBlocked.map((app, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      <span className="text-sm font-medium">{app.appName}</span>
                      <span className="text-xs text-muted-foreground">- {app.windowTitle}</span>
                    </div>
                    <span className="text-sm font-bold text-red-500">{app.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Productive Apps */}
          {topProductive.length > 0 && (
            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
            }`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Top Productive Activities
              </h3>
              <div className="space-y-2">
                {topProductive.map((app, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      <span className="text-sm font-medium">{app.appName}</span>
                      <span className="text-xs text-muted-foreground">- {app.windowTitle}</span>
                    </div>
                    <span className="text-sm font-bold text-green-500">{app.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Motivational Message */}
          <div className={`p-4 rounded-xl text-center ${
            theme === 'dark' ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : 'bg-gradient-to-r from-blue-50 to-purple-50'
          }`}>
            <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-semibold mb-2">Excellent Focus!</h3>
            <p className="text-sm text-muted-foreground">
              You maintained {efficiency}% productivity throughout your session.
              Keep up the great work on your goals!
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-border">
          <Button
            onClick={onClose}
            className="flex-1 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
          >
            Start New Session
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};