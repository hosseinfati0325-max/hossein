import {
  SyncQueueItem,
  SyncItemType,
  SyncStatus,
  SyncLogEntry,
  ExamResultRecord,
  UserProgress,
} from '../types';

const SYNC_QUEUE_KEY = 'hossein_fatemeh_sync_queue_v1';
const SYNC_LOGS_KEY = 'hossein_fatemeh_sync_logs_v1';
const LAST_SYNCED_KEY = 'hossein_fatemeh_last_synced_time_v1';

type SyncListener = (state: {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastSyncMessage?: string;
  syncLogs: SyncLogEntry[];
}) => void;

class SyncService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncStatus: SyncStatus = 'idle';
  private lastSyncedAt: string | null = null;
  private lastSyncMessage: string = '';
  private listeners: Set<SyncListener> = new Set();
  private pingIntervalId: any = null;
  private isSyncing: boolean = false;
  private isRegisteringNetwork: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      this.lastSyncedAt = localStorage.getItem(LAST_SYNCED_KEY) || null;
    } catch {
      this.lastSyncedAt = null;
    }

    // Window online / offline listeners
    window.addEventListener('online', () => {
      this.handleNetworkChange(true);
    });

    window.addEventListener('offline', () => {
      this.handleNetworkChange(false);
    });

    // Start background heartbeats & initial check
    this.checkConnectivity();
    this.pingIntervalId = setInterval(() => {
      this.checkConnectivity();
    }, 25000);
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    // Send immediate initial state
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        console.warn('Error notifying sync listener:', e);
      }
    });
  }

  public getState() {
    const queue = this.getQueue();
    return {
      isOnline: this.isOnline,
      syncStatus: this.syncStatus,
      pendingCount: queue.length,
      lastSyncedAt: this.lastSyncedAt,
      lastSyncMessage: this.lastSyncMessage,
      syncLogs: this.getLogs(),
    };
  }

  // Network State Change Handler
  private async handleNetworkChange(online: boolean) {
    if (online) {
      // Confirm with real ping
      const verified = await this.checkConnectivity();
      if (verified) {
        this.addLog('اتصال به اینترنت برقرار شد', 'progress_snapshot', 'success', 'اینترنت بازیابی شد. آغاز همگام‌سازی...');
        // Auto push pending queue
        await this.syncPendingQueue();
      }
    } else {
      this.isOnline = false;
      this.syncStatus = 'offline';
      this.lastSyncMessage = 'دستگاه آفلاین است. تغییرات در صف محلی ذخیره می‌شوند.';
      this.addLog('قطع اتصال اینترنت', 'progress_snapshot', 'queued', 'تغییرات به صورت آفلاین ذخیره خواهند شد.');
      this.notify();
    }
  }

  // Check connectivity to backend API
  public async checkConnectivity(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (this.isOnline) {
        this.isOnline = false;
        this.syncStatus = 'offline';
        this.notify();
      }
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const wasOffline = !this.isOnline;
        this.isOnline = true;
        if (wasOffline) {
          this.syncStatus = 'pending';
          this.notify();
          await this.syncPendingQueue();
        } else if (this.syncStatus === 'offline' || this.syncStatus === 'error') {
          this.syncStatus = this.getQueue().length > 0 ? 'pending' : 'synced';
          this.notify();
        }
        return true;
      } else {
        this.isOnline = false;
        this.syncStatus = 'offline';
        this.notify();
        return false;
      }
    } catch {
      this.isOnline = false;
      this.syncStatus = 'offline';
      this.notify();
      return false;
    }
  }

  // Get offline queue from storage
  public getQueue(): SyncQueueItem[] {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse sync queue:', e);
    }
    return [];
  }

  // Save offline queue to storage
  private saveQueue(queue: SyncQueueItem[]) {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save sync queue:', e);
    }
  }

  // Get logs
  public getLogs(): SyncLogEntry[] {
    try {
      const stored = localStorage.getItem(SYNC_LOGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse sync logs:', e);
    }
    return [];
  }

  // Add a log entry
  private addLog(
    titleFa: string,
    itemType: SyncItemType,
    status: 'success' | 'failed' | 'queued',
    details?: string,
  ) {
    try {
      const logs = this.getLogs();
      const newEntry: SyncLogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        titleFa,
        itemType,
        timestamp: new Date().toISOString(),
        status,
        details,
      };
      logs.unshift(newEntry);
      if (logs.length > 40) {
        logs.pop();
      }
      localStorage.setItem(SYNC_LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to write sync log:', e);
    }
  }

  // Enqueue a mutation for background sync
  public enqueue(
    userId: string,
    type: SyncItemType,
    payload: any,
    titleFa: string = 'بروزرسانی داده‌ها',
    userSnapshot?: UserProgress,
  ) {
    const queue = this.getQueue();

    // Check if progress_snapshot already in queue for this user, replace it to avoid bloat
    if (type === 'progress_snapshot') {
      const existingIdx = queue.findIndex((q) => q.type === 'progress_snapshot' && q.userId === userId);
      if (existingIdx >= 0) {
        queue[existingIdx] = {
          id: queue[existingIdx].id,
          type,
          userId,
          payload,
          timestamp: Date.now(),
          retryCount: 0,
        };
        this.saveQueue(queue);
        this.triggerAutoSyncIfOnline(userSnapshot);
        return;
      }
    }

    const newItem: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      userId,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    queue.push(newItem);
    this.saveQueue(queue);

    this.addLog(
      titleFa,
      type,
      this.isOnline ? 'queued' : 'queued',
      this.isOnline ? 'در صف ارسال به سرور قرار گرفت.' : 'آفلاین: در حافظه محلی رزرو شد.',
    );

    this.syncStatus = this.isOnline ? 'pending' : 'offline';
    this.notify();

    this.triggerAutoSyncIfOnline(userSnapshot);
  }

  // Trigger auto sync if currently online
  private triggerAutoSyncIfOnline(userSnapshot?: UserProgress) {
    if (this.isOnline && !this.isSyncing) {
      setTimeout(() => {
        this.syncPendingQueue(userSnapshot);
      }, 1000);
    }
  }

  // Sync entire pending queue to server
  public async syncPendingQueue(userSnapshot?: UserProgress): Promise<{
    success: boolean;
    syncedCount: number;
    error?: string;
  }> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, error: 'همگام‌سازی در حال انجام است.' };
    }

    const queue = this.getQueue();
    if (queue.length === 0 && !userSnapshot) {
      this.syncStatus = 'synced';
      this.notify();
      return { success: true, syncedCount: 0 };
    }

    this.isSyncing = true;
    this.syncStatus = 'syncing';
    this.lastSyncMessage = 'در حال ارسال اطلاعات و نتایج آزمون به سرور...';
    this.notify();

    // 0. Quick pre-flight check to verify server availability before firing batch sync
    try {
      const pingController = new AbortController();
      const pingTimeout = setTimeout(() => pingController.abort(), 2500);
      const pingRes = await fetch('/api/health', {
        method: 'GET',
        signal: pingController.signal,
        cache: 'no-store',
      });
      clearTimeout(pingTimeout);
      if (!pingRes.ok) {
        throw new Error('Server health check returned non-200');
      }
    } catch {
      // Server is currently unavailable or offline - keep queue safe locally without throwing an error
      this.isSyncing = false;
      this.isOnline = false;
      this.syncStatus = 'offline';
      this.lastSyncMessage = 'تغییرات در صف محلی نگهداری می‌شوند (سرور موقتاً در دسترس نیست).';
      this.notify();
      return { success: false, syncedCount: 0, error: 'Server unreachable' };
    }

    try {
      const activeUserId = userSnapshot?.id || (queue.length > 0 ? queue[0].userId : 'user_default');

      // 1. First push dedicated exam results if any
      const examItems = queue.filter((q) => q.type === 'exam_result' && q.payload);
      for (const examItem of examItems) {
        try {
          await fetch('/api/sync/exam-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ examResult: examItem.payload }),
          });
        } catch (e) {
          console.warn('Failed to sync individual exam result:', e);
        }
      }

      // 2. Push entire batch with user snapshot
      const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUserId,
          items: queue,
          userSnapshot: userSnapshot || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const processedIds: string[] = data.processedItemIds || [];

      // Remove successfully processed items from queue
      const remainingQueue = queue.filter((item) => !processedIds.includes(item.id));
      this.saveQueue(remainingQueue);

      const nowIso = new Date().toISOString();
      this.lastSyncedAt = nowIso;
      try {
        localStorage.setItem(LAST_SYNCED_KEY, nowIso);
      } catch {}

      this.syncStatus = remainingQueue.length > 0 ? 'pending' : 'synced';
      this.lastSyncMessage = `همگام‌سازی کامل شد (${processedIds.length} مورد با موفقیت ثبت شد).`;
      this.isOnline = true;

      this.addLog(
        'همگام‌سازی خودکار با سرور',
        'progress_snapshot',
        'success',
        `تعداد ${processedIds.length} داده و نتایج آزمون در پایگاه داده ابری ثبت شد.`,
      );

      this.isSyncing = false;
      this.notify();

      // Dispatch custom DOM event for toast notification if desired
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('app-sync-completed', {
            detail: { count: processedIds.length, timestamp: nowIso },
          }),
        );
      }

      return { success: true, syncedCount: processedIds.length };
    } catch (error: any) {
      console.warn('Background sync deferred (operating offline):', error?.message || error);
      this.isSyncing = false;
      this.isOnline = false;
      this.syncStatus = 'offline';
      this.lastSyncMessage = 'تغییرات در صف محلی ذخیره شدند. همگام‌سازی به محض اتصال برقرار می‌شود.';

      this.addLog(
        'همگام‌سازی در صف محلی نگهداری شد',
        'progress_snapshot',
        'queued',
        `داده‌ها در حافظه محلی ذخیره شدند (${error?.message || 'در انتظار اتصال'}).`,
      );

      this.notify();
      return { success: false, syncedCount: 0, error: error?.message || 'Sync deferred' };
    }
  }

  // Clear pending queue manually
  public clearQueue() {
    this.saveQueue([]);
    this.syncStatus = 'synced';
    this.addLog('پاک‌سازی صف همگام‌سازی', 'progress_snapshot', 'success', 'صف محلی توسط کاربر خالی شد.');
    this.notify();
  }

  // Automatic Network Registration & Capacity Syncing
  // Called automatically when app launches or network reconnects
  public async registerUserToNetwork(userSnapshot: UserProgress): Promise<any> {
    if (!userSnapshot || !userSnapshot.id) return null;
    if (this.isRegisteringNetwork) return null;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return null;

    this.isRegisteringNetwork = true;
    try {
      const response = await fetch('/api/capacity/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSnapshot: {
            id: userSnapshot.id,
            name: userSnapshot.name,
            firstName: userSnapshot.firstName || '',
            lastName: userSnapshot.lastName || '',
            avatar: userSnapshot.avatar || '🦁',
            targetLanguage: userSnapshot.targetLanguage || 'en',
            currentLevel: userSnapshot.currentLevel || 'A1',
            xp: userSnapshot.xp || 100,
            streak: userSnapshot.streak || 1,
            registeredAt: userSnapshot.registeredAt || new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.capacity) {
          try {
            localStorage.setItem('lingua_network_capacity_v1', JSON.stringify(data.capacity));
          } catch {}

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('network-capacity-updated', {
                detail: data.capacity,
              })
            );
          }
          return data.capacity;
        }
      }
    } catch (e: any) {
      console.warn('Network registration ping skipped (working offline):', e?.message || e);
    } finally {
      this.isRegisteringNetwork = false;
    }
    return null;
  }

  // Fetch live network capacity
  public async fetchLiveCapacity(): Promise<any> {
    try {
      const res = await fetch('/api/capacity/live');
      if (res.ok) {
        const data = await res.json();
        if (data && data.capacity) {
          try {
            localStorage.setItem('lingua_network_capacity_v1', JSON.stringify(data.capacity));
          } catch {}
          return data.capacity;
        }
      }
    } catch (e) {
      // offline
    }

    try {
      const cached = localStorage.getItem('lingua_network_capacity_v1');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  }
}

export const syncService = new SyncService();

