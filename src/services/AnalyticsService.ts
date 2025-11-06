interface SessionHistoryEntry {
  date: string; // YYYY-MM-DD format
  focusTimeMs: number;
  blocksCount: number;
  tasksCompleted: string[];
  topApps: Array<{ app: string; timeMs: number }>;
}

interface AllTimeStats {
  totalSessions: number;
  totalBlocks: number;
  totalFocusTimeMs: number;
  mostProductiveApp: string;
  mostBlockedApp: string;
}

interface AnalyticsData {
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD format
  totalFocusTimeMs: number;
  weeklyActivity: number[]; // [7] - focus time per day (Sun-Sat)
  allTimeStats: AllTimeStats;
  sessionHistory: SessionHistoryEntry[];
}

const STORAGE_KEY = 'flowstate_analytics';
const MAX_HISTORY_DAYS = 90; // Keep 3 months of history

class AnalyticsService {
  private data: AnalyticsData;

  constructor() {
    this.data = this.loadData();
  }

  private getDefaultData(): AnalyticsData {
    return {
      streakDays: 0,
      lastActiveDate: '',
      totalFocusTimeMs: 0,
      weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
      allTimeStats: {
        totalSessions: 0,
        totalBlocks: 0,
        totalFocusTimeMs: 0,
        mostProductiveApp: '',
        mostBlockedApp: '',
      },
      sessionHistory: [],
    };
  }

  private loadData(): AnalyticsData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return this.getDefaultData();

      const parsed = JSON.parse(stored) as AnalyticsData;
      // Ensure all properties exist (for migration)
      return { ...this.getDefaultData(), ...parsed };
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      return this.getDefaultData();
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save analytics data:', error);
    }
  }

  private getTodayString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private getDayOfWeek(dateString: string): number {
    // Returns 0 (Sun) - 6 (Sat)
    return new Date(dateString).getDay();
  }

  private calculateStreak(): void {
    const today = this.getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    if (this.data.lastActiveDate === today) {
      // Already counted today
      return;
    }

    if (this.data.lastActiveDate === yesterdayString) {
      // Consecutive day
      this.data.streakDays++;
    } else if (this.data.lastActiveDate === '') {
      // First ever session
      this.data.streakDays = 1;
    } else {
      // Streak broken
      this.data.streakDays = 1;
    }

    this.data.lastActiveDate = today;
  }

  /**
   * Record a completed focus session
   */
  recordSession(
    focusTimeMs: number,
    blocksCount: number,
    task: string,
    topApps: Array<{ app: string; timeMs: number }>
  ): void {
    const today = this.getTodayString();
    const dayOfWeek = this.getDayOfWeek(today);

    // Update streak
    this.calculateStreak();

    // Update weekly activity (accumulate for today)
    this.data.weeklyActivity[dayOfWeek] += focusTimeMs;

    // Update total focus time
    this.data.totalFocusTimeMs += focusTimeMs;

    // Update all-time stats
    this.data.allTimeStats.totalSessions++;
    this.data.allTimeStats.totalBlocks += blocksCount;
    this.data.allTimeStats.totalFocusTimeMs += focusTimeMs;

    // Find or create today's session entry
    let todayEntry = this.data.sessionHistory.find(entry => entry.date === today);
    if (!todayEntry) {
      todayEntry = {
        date: today,
        focusTimeMs: 0,
        blocksCount: 0,
        tasksCompleted: [],
        topApps: [],
      };
      this.data.sessionHistory.push(todayEntry);
    }

    // Update today's entry
    todayEntry.focusTimeMs += focusTimeMs;
    todayEntry.blocksCount += blocksCount;
    if (task) {
      todayEntry.tasksCompleted.push(task);
    }

    // Merge top apps (accumulate time)
    topApps.forEach(({ app, timeMs }) => {
      const existing = todayEntry!.topApps.find(a => a.app === app);
      if (existing) {
        existing.timeMs += timeMs;
      } else {
        todayEntry!.topApps.push({ app, timeMs });
      }
    });

    // Sort top apps by time
    todayEntry.topApps.sort((a, b) => b.timeMs - a.timeMs);

    // Cleanup old history
    this.cleanupOldHistory();

    // Save to localStorage
    this.saveData();
  }

  /**
   * Update the most productive/blocked apps based on current data
   */
  updateTopApps(productiveApp: string, blockedApp: string): void {
    if (productiveApp) {
      this.data.allTimeStats.mostProductiveApp = productiveApp;
    }
    if (blockedApp) {
      this.data.allTimeStats.mostBlockedApp = blockedApp;
    }
    this.saveData();
  }

  /**
   * Get weekly activity for the last 7 days (relative to today)
   */
  getWeeklyActivity(): number[] {
    const today = new Date();
    const weekly: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const entry = this.data.sessionHistory.find(e => e.date === dateString);
      weekly.push(entry ? entry.focusTimeMs : 0);
    }

    return weekly;
  }

  /**
   * Get current streak
   */
  getStreak(): number {
    // Check if streak is still valid (last active yesterday or today)
    const today = this.getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    if (this.data.lastActiveDate === today || this.data.lastActiveDate === yesterdayString) {
      return this.data.streakDays;
    }

    // Streak broken, reset
    return 0;
  }

  /**
   * Get total focus time (all time)
   */
  getTotalFocusTime(): number {
    return this.data.totalFocusTimeMs;
  }

  /**
   * Get blocks today
   */
  getBlocksToday(): number {
    const today = this.getTodayString();
    const todayEntry = this.data.sessionHistory.find(e => e.date === today);
    return todayEntry ? todayEntry.blocksCount : 0;
  }

  /**
   * Get all-time stats
   */
  getAllTimeStats(): AllTimeStats {
    return { ...this.data.allTimeStats };
  }

  /**
   * Get recent completed tasks (last 10)
   */
  getRecentTasks(): string[] {
    const tasks: string[] = [];

    // Get last 7 days of history
    const sortedHistory = [...this.data.sessionHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);

    for (const entry of sortedHistory) {
      tasks.push(...entry.tasksCompleted);
      if (tasks.length >= 10) break;
    }

    return tasks.slice(0, 10);
  }

  /**
   * Cleanup history older than MAX_HISTORY_DAYS
   */
  private cleanupOldHistory(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    this.data.sessionHistory = this.data.sessionHistory.filter(
      entry => entry.date >= cutoffString
    );
  }

  /**
   * Reset all analytics data (for testing)
   */
  reset(): void {
    this.data = this.getDefaultData();
    this.saveData();
  }

  /**
   * Mark activity for today (updates streak even without completing session)
   */
  markActivityToday(): void {
    const today = this.getTodayString();
    if (this.data.lastActiveDate !== today) {
      this.calculateStreak();
      this.saveData();
    }
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
export type { AnalyticsData, SessionHistoryEntry, AllTimeStats };
