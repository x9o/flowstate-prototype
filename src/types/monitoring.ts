export interface WindowInfo {
  title: string;
  app: string;
  category: string;
  url?: string;
  memoryUsage?: number;
}

export interface SessionStats {
  totalChecks: number;
  blockedAttempts: number;
  sessionStartTime: number | null;
  currentWindow: WindowInfo | null;
}

export interface MonitoringState {
  isActive: boolean;
  currentGoals: string[];
  sessionStats: SessionStats;
  sessionDuration: number;
}

export interface MonitoringStatusChange {
  isActive: boolean;
  goals: string[];
  sessionStats: SessionStats;
}

export interface ActivityBlockedEvent {
  window: string;
  app: string;
  category: string;
}

export interface MonitoringErrorEvent {
  error: string;
}