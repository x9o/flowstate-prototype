import { useTheme } from '@/contexts/ThemeContext';
import { useMonitoring } from '@/contexts/MonitoringContext';
import { Activity, Shield, Clock, AlertTriangle } from 'lucide-react';

export const MonitoringStatus = () => {
  const { theme } = useTheme();
  const { monitoringState } = useMonitoring();

  if (!monitoringState.isActive) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sessionDuration = monitoringState.sessionStats.sessionStartTime
    ? Math.round((Date.now() - monitoringState.sessionStats.sessionStartTime) / 1000)
    : 0;

  const getStatusColor = () => {
    if (monitoringState.sessionStats.blockedAttempts > 0) {
      return theme === 'dark' ? 'text-orange-400' : 'text-orange-600';
    }
    return theme === 'dark' ? 'text-green-400' : 'text-green-600';
  };

  const getStatusIcon = () => {
    if (monitoringState.sessionStats.blockedAttempts > 0) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <Shield className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (monitoringState.sessionStats.blockedAttempts > 0) {
      return `${monitoringState.sessionStats.blockedAttempts} blocked`;
    }
    return 'Monitoring active';
  };

  return (
    <div className={`fixed top-20 right-4 z-50 p-3 rounded-xl shadow-lg backdrop-blur-sm ${
      theme === 'dark'
        ? 'bg-gray-800/90 border-gray-700'
        : 'bg-white/90 border-gray-200'
    } border`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-lg ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <div>
          <p className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </p>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {monitoringState.currentGoals.length} goal{monitoringState.currentGoals.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Current Window */}
      {monitoringState.sessionStats.currentWindow && (
        <div className={`mb-2 p-2 rounded-lg ${
          theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'
        }`}>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-medium truncate ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {monitoringState.sessionStats.currentWindow.title}
              </p>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {monitoringState.sessionStats.currentWindow.app}
                {monitoringState.sessionStats.currentWindow.category &&
                  ` • ${monitoringState.sessionStats.currentWindow.category}`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {formatTime(sessionDuration)}
          </span>
        </div>
        <div className={`text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {monitoringState.sessionStats.totalChecks} checks
        </div>
      </div>

      {/* Goals Summary */}
      {monitoringState.currentGoals.length > 0 && (
        <div className={`mt-2 pt-2 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={`text-xs font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Active Goals:
          </p>
          <div className="space-y-1">
            {monitoringState.currentGoals.slice(0, 3).map((goal, index) => (
              <div
                key={index}
                className={`text-xs truncate ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                • {goal}
              </div>
            ))}
            {monitoringState.currentGoals.length > 3 && (
              <div className={`text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                +{monitoringState.currentGoals.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};