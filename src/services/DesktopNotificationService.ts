interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
}

class DesktopNotificationService {
  private isEnabled: boolean = false;
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
  }

  private checkSupport(): void {
    // Check if running in Electron and Notification API is available
    this.isSupported = typeof window !== 'undefined' &&
                     'Notification' in window &&
                     (window as any).electronAPI;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Desktop notifications are not supported in this environment');
      return false;
    }

    try {
      // In Electron, permissions are typically granted automatically
      // But we should still check and handle any permission requirements
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        this.isEnabled = permission === 'granted';
      } else {
        this.isEnabled = Notification.permission === 'granted';
      }

      return this.isEnabled;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isSupported) {
      console.warn('Desktop notifications are not supported');
      return;
    }

    if (!this.isEnabled) {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return;
      }
    }

    try {
      // Use Electron's notification API if available
      if ((window as any).electronAPI?.showNotification) {
        await (window as any).electronAPI.showNotification({
          title: options.title,
          body: options.body,
          icon: options.icon || '/flowstate_transparent_light_resized.png',
          silent: options.silent || false
        });
      } else {
        // Fallback to web Notification API
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/flowstate_transparent_light_resized.png',
          silent: options.silent || false,
          tag: 'flowstate-focus-reminder'
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        // Handle click events
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    } catch (error) {
      console.error('Failed to show desktop notification:', error);
    }
  }

  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  isNotificationEnabled(): boolean {
    return this.isEnabled;
  }
}

export const desktopNotificationService = new DesktopNotificationService();