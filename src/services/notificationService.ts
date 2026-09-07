// Notification & Background Sync Service for PWA
export interface NotificationOptionsCustom {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{ action: string; title: string }>;
}

class NotificationService {
  private reminderTimer: NodeJS.Timeout | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.registerPeriodicSync();
      }
      return permission;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return 'denied';
    }
  }

  public async showNotification(options: NotificationOptionsCustom): Promise<boolean> {
    if (!this.isSupported()) return false;

    if (Notification.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') return false;
    }

    try {
      // Prefer ServiceWorker showNotification if available (supports actions, badges, vibration)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(options.title, {
            body: options.body,
            icon: options.icon || '/app-logo.jpg',
            badge: options.badge || '/app-logo.jpg',
            tag: options.tag || 'daily-reminder',
            data: options.data || { url: '/?tab=learn' },
            actions: options.actions || [
              { action: 'open_lesson', title: '🚀 شروع درس روز' },
              { action: 'open_flashcards', title: '🃏 مرور لایتنر' },
            ],
            vibrate: [100, 50, 100],
          } as any);
          return true;
        }
      }

      // Standard browser Notification fallback
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/app-logo.jpg',
        tag: options.tag || 'daily-reminder',
      });
      return true;
    } catch (err) {
      console.error('Error showing notification:', err);
      return false;
    }
  }

  // Register Background Sync when network returns
  public async registerBackgroundSync(tag: string = 'sync-progress'): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;

    try {
      const registration = (await navigator.serviceWorker.ready) as any;
      if (registration && 'sync' in registration) {
        await registration.sync.register(tag);
        console.log(`[BackgroundSync] Registered sync tag: "${tag}"`);
        return true;
      }
    } catch (err) {
      console.warn('[BackgroundSync] Sync registration failed:', err);
    }
    return false;
  }

  // Register Periodic Background Sync (runs in background even when browser is closed on supported Android/Chrome)
  public async registerPeriodicSync(tag: string = 'daily-reminder-sync'): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;

    try {
      const registration = (await navigator.serviceWorker.ready) as any;
      if (registration && 'periodicSync' in registration) {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as any,
        });

        if (status.state === 'granted') {
          await registration.periodicSync.register(tag, {
            minInterval: 24 * 60 * 60 * 1000, // 24 hours
          });
          console.log(`[PeriodicSync] Registered periodic sync tag: "${tag}"`);
          return true;
        }
      }
    } catch (err) {
      console.warn('[PeriodicSync] Periodic sync registration note:', err);
    }
    return false;
  }

  // Setup client daily reminder check loop
  public setupDailyReminderCheck(
    userName: string,
    reminderHour: number,
    streakCount: number,
    enabled: boolean
  ) {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
      this.reminderTimer = null;
    }

    if (!enabled || !this.isSupported()) return;

    // Check once every 10 minutes if current hour matches reminder hour
    this.reminderTimer = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const lastSentDate = localStorage.getItem('last_reminder_sent_date');
      const todayDateStr = now.toISOString().slice(0, 10);

      if (currentHour === reminderHour && lastSentDate !== todayDateStr) {
        localStorage.setItem('last_reminder_sent_date', todayDateStr);
        this.showNotification({
          title: '🔥 وقت تمرین امروز فرا رسیده!',
          body: `سلام ${userName}! استریک ${streakCount} روزه شما چشم‌به‌راه است. فقط ۵ دقیقه تمرین تا یادگیری مداوم.`,
          tag: 'daily-streak-reminder',
          data: { url: '/?tab=learn' },
        });
      }
    }, 10 * 60 * 1000);
  }
}

export const notificationService = new NotificationService();
