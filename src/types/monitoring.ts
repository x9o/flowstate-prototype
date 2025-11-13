export interface WindowInfo {
  title: string;
  app: string;
  category: string;
  url?: string;
  memoryUsage?: number;
  owner?: {
    name: string;
  };
}

export interface AppCount {
  app: string;
  count: number;
}

export interface BlockEvent {
  app: string;
  title: string;
  timestamp: number;
}

export interface SessionStats {
  totalChecks: number;
  blockedAttempts: number;
  productiveChecks: number;
  sessionStartTime: number | null;
  currentWindow: WindowInfo | null;
  topProductiveApps: AppCount[];
  topBlockedApps: AppCount[];
  recentBlocks: BlockEvent[];
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
  windowInfo: WindowInfo;
  goal: string;
  timestamp: number;
}

export interface MonitoringErrorEvent {
  error: string;
}

export type BlockingMode = 'gentle' | 'hard';