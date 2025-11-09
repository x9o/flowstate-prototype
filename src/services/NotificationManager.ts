import { desktopNotificationService } from './DesktopNotificationService';

interface ReminderMessages {
  motivational: string[];
  focus: string[];
  goal: string[];
  progress: string[];
}

const reminderMessages: ReminderMessages = {
  motivational: [
    "You're doing great! Keep up the focus! 🎯",
    "Stay strong! Your focus is paying off. 💪",
    "Every moment of focus brings you closer to your goal. ✨",
    "You've got this! Maintain your momentum. 🚀",
    "Amazing focus! You're on fire! 🔥",
    "Keep going! Success is built moment by moment. 🏗️",
    "Your dedication is inspiring! 🌟",
    "Stay in the zone! You're crushing it. 💯"
  ],
  focus: [
    "Time to check in: Are you still focused on your goal? 🎯",
    "Quick reminder: Stay on track with your current task. 📋",
    "Mindful moment: Bring your attention back to your goal. 🧘",
    "Focus check: Is what you're doing aligned with your goal? 🤔",
    "Stay present: Return your focus to the task at hand. 🎯"
  ],
  goal: [
    "Remember your goal: {goal} 🎯",
    "Your goal '{goal}' is waiting for you! ⏰",
    "Every focused moment serves your goal: {goal} 🏆",
    "Keep your goal '{goal}' in mind and stay strong! 💪",
    "Progress on '{goal}' happens one focused moment at a time. ⏳"
  ],
  progress: [
    "Time invested: {minutes} minutes of focused work! ⏱️",
    "You've been focused for {minutes} minutes. That's progress! 📈",
    "{minutes} minutes of deep work. Your future self will thank you! 🙏",
    "Focus streak: {minutes} minutes and counting! 🔥",
    "Building momentum: {minutes} minutes of quality focus. 💪"
  ]
};

class NotificationManager {
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: number | null = null;
  private notificationInterval: number = 0; // in minutes, 0 = disabled
  private soundEnabled: boolean = true;

  constructor() {
    // Request permission on initialization
    desktopNotificationService.requestPermission();
  }

  startMonitoring(intervalMinutes: number, soundEnabled: boolean = true): void {
    this.stopMonitoring(); // Clear any existing intervals
    this.notificationInterval = intervalMinutes;
    this.soundEnabled = soundEnabled;

    if (intervalMinutes === 0) {
      console.log('Desktop notifications are disabled');
      return;
    }

    this.startTime = Date.now();
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(`Starting desktop notifications every ${intervalMinutes} minutes`);

    // Schedule first notification after the interval
    this.intervalId = setInterval(() => {
      this.sendReminderNotification();
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.startTime = null;
    console.log('Desktop notifications stopped');
  }

  private async sendReminderNotification(): Promise<void> {
    if (!this.startTime) return;

    const elapsedMinutes = Math.floor((Date.now() - this.startTime) / (60 * 1000));
    const message = this.generateRandomMessage(elapsedMinutes);

    try {
      await desktopNotificationService.showNotification({
        title: 'FlowState Focus Reminder',
        body: message,
        silent: !this.soundEnabled,
        icon: '/flowstate_transparent_light_resized.png'
      });

      console.log('Desktop notification sent:', message);
    } catch (error) {
      console.error('Failed to send desktop notification:', error);
    }
  }

  private generateRandomMessage(elapsedMinutes: number): string {
    const allMessages = [
      ...reminderMessages.motivational,
      ...reminderMessages.focus,
      ...reminderMessages.goal,
      ...reminderMessages.progress
    ];

    // Filter out goal-specific messages if no goal is set
    const availableMessages = allMessages.filter(msg =>
      !msg.includes('{goal}')
    );

    // Select a random message
    const randomMessage = availableMessages[Math.floor(Math.random() * availableMessages.length)];

    // Replace placeholders
    return randomMessage
      .replace('{minutes}', elapsedMinutes.toString())
      .replace('{goal}', this.getCurrentGoal() || 'your goal');
  }

  private getCurrentGoal(): string | null {
    // This should get the current goal from the monitoring context
    // For now, we'll return null and let the component handle it
    return null;
  }

  updateGoal(goal: string): void {
    // Store the current goal for use in notifications
    // This would be called when the goal changes
    (this as any).currentGoal = goal;
  }

  isActive(): boolean {
    return this.intervalId !== null;
  }

  getInterval(): number {
    return this.notificationInterval;
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}

export const notificationManager = new NotificationManager();