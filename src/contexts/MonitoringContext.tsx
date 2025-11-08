import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MonitoringState, WindowInfo, ActivityBlockedEvent, MonitoringErrorEvent } from '../types/monitoring';

interface ListItem {
  id: string;
  name: string;
  pattern: string;
  icon?: string;
}

interface BlockedApp {
  appName: string;
  windowTitle: string;
  blockedAt: number;
  goal: string;
}

interface MonitoringContextType {
  monitoringState: MonitoringState;
  isPaused: boolean;
  recentBlockedApps: BlockedApp[];
  strictnessLevel: 'lenient' | 'balanced' | 'strict';
  setStrictnessLevel: (level: 'lenient' | 'balanced' | 'strict') => void;
  startMonitoring: (goals: string[], duration: number, whitelist?: ListItem[], blocklist?: ListItem[]) => Promise<void>;
  pauseMonitoring: () => Promise<void>;
  resumeMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  getMonitoringStatus: () => Promise<MonitoringState>;
  clearBlockedApps: () => void;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

interface MonitoringProviderProps {
  children: ReactNode;
}

export const MonitoringProvider: React.FC<MonitoringProviderProps> = ({ children }) => {
  const [monitoringState, setMonitoringState] = useState<MonitoringState>({
    isActive: false,
    currentGoals: [],
    sessionStats: {
      totalChecks: 0,
      blockedAttempts: 0,
      sessionStartTime: null,
      currentWindow: null
    },
    sessionDuration: 0
  });

  const [isPaused, setIsPaused] = useState(false);
  const [recentBlockedApps, setRecentBlockedApps] = useState<BlockedApp[]>([]);
  const [strictnessLevel, setStrictnessLevel] = useState<'lenient' | 'balanced' | 'strict'>('balanced');

  // Start monitoring session
  const startMonitoring = async (goals: string[], duration: number, whitelist?: ListItem[], blocklist?: ListItem[]): Promise<void> => {
    try {
      console.log('🔗 MonitoringContext.startMonitoring called with:', {
        goals,
        duration,
        whitelistLength: whitelist?.length || 0,
        blocklistLength: blocklist?.length || 0,
        whitelistItems: whitelist?.map(item => ({ name: item.name, pattern: item.pattern })) || [],
        blocklistItems: blocklist?.map(item => ({ name: item.name, pattern: item.pattern })) || []
      });

      // Clear recent blocked apps when starting a new session
      setRecentBlockedApps([]);

      const result = await window.electronAPI.startMonitoring(goals, duration, whitelist, blocklist, strictnessLevel);
      if (!result.success) {
        throw new Error(result.error || 'Failed to start monitoring');
      }
    } catch (error) {
      console.error('Error starting monitoring:', error);
      throw error;
    }
  };

  // Pause monitoring session
  const pauseMonitoring = async (): Promise<void> => {
    try {
      setIsPaused(true);
      console.log('⏸️ Monitoring paused');
      // Note: Actual pause functionality would be implemented in the monitoring service
      // For now, we'll track the pause state in the UI
    } catch (error) {
      console.error('Error pausing monitoring:', error);
      throw error;
    }
  };

  // Resume monitoring session
  const resumeMonitoring = async (): Promise<void> => {
    try {
      setIsPaused(false);
      console.log('▶️ Monitoring resumed');
      // Note: Actual resume functionality would be implemented in the monitoring service
      // For now, we'll track the pause state in the UI
    } catch (error) {
      console.error('Error resuming monitoring:', error);
      throw error;
    }
  };

  // Stop monitoring session
  const stopMonitoring = async (): Promise<void> => {
    try {
      setIsPaused(false); // Reset pause state when stopping
      const result = await window.electronAPI.stopMonitoring();
      if (!result.success) {
        throw new Error(result.error || 'Failed to stop monitoring');
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error);
      throw error;
    }
  };

  // Clear recent blocked apps
  const clearBlockedApps = (): void => {
    setRecentBlockedApps([]);
  };

  // Get current monitoring status
  const getMonitoringStatus = async (): Promise<MonitoringState> => {
    try {
      const status = await window.electronAPI.getMonitoringStatus();
      return status;
    } catch (error) {
      console.error('Error getting monitoring status:', error);
      return monitoringState;
    }
  };

  // Set up event listeners for monitoring events
  useEffect(() => {
    // Listen for monitoring status changes
    const handleStatusChange = (_event: any, data: any) => {
      console.log('Monitoring status changed:', data);
      setMonitoringState(prev => ({
        ...prev,
        isActive: data.isActive,
        currentGoals: data.goals || [],
        sessionStats: data.sessionStats || prev.sessionStats
      }));
    };

    // Listen for window detection events
    const handleWindowDetected = (_event: any, data: WindowInfo) => {
      console.log('Window detected:', data);
      setMonitoringState(prev => ({
        ...prev,
        sessionStats: {
          ...prev.sessionStats,
          currentWindow: data
        }
      }));
    };

    // Listen for activity blocked events
    const handleActivityBlocked = (_event: any, data: ActivityBlockedEvent) => {
      console.log('Activity blocked:', data);
      setMonitoringState(prev => ({
        ...prev,
        sessionStats: {
          ...prev.sessionStats,
          blockedAttempts: prev.sessionStats.blockedAttempts + 1
        }
      }));

      // Add to recent blocked apps
      const blockedApp: BlockedApp = {
        appName: data.windowInfo.owner?.name || data.windowInfo.app || 'Unknown',
        windowTitle: data.windowInfo.title,
        blockedAt: data.timestamp || Date.now(),
        goal: data.goal || prev.currentGoals[0] || 'Unknown'
      };

      setRecentBlockedApps(prev => [blockedApp, ...prev.slice(0, 4)]); // Keep only 5 most recent
    };

    // Listen for monitoring errors
    const handleMonitoringError = (_event: any, data: MonitoringErrorEvent) => {
      console.error('Monitoring error:', data);
      // Could show error toast here
    };

    // Register event listeners
    window.electronAPI.onMonitoringStatusChange(handleStatusChange);
    window.electronAPI.onWindowDetected(handleWindowDetected);
    window.electronAPI.onActivityBlocked(handleActivityBlocked);
    window.electronAPI.onMonitoringError(handleMonitoringError);

    // Cleanup function
    return () => {
      window.electronAPI.removeAllListeners('monitoring-status-change');
      window.electronAPI.removeAllListeners('window-detected');
      window.electronAPI.removeAllListeners('activity-blocked');
      window.electronAPI.removeAllListeners('monitoring-error');
    };
  }, []);

  const value: MonitoringContextType = {
    monitoringState,
    isPaused,
    recentBlockedApps,
    strictnessLevel,
    setStrictnessLevel,
    startMonitoring,
    pauseMonitoring,
    resumeMonitoring,
    stopMonitoring,
    getMonitoringStatus,
    clearBlockedApps
  };

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = (): MonitoringContextType => {
  const context = useContext(MonitoringContext);
  if (context === undefined) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};