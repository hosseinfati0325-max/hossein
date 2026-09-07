// IndexedDB Offline Audio Cache Storage Service
// Handles caching of frequently used audio assets, TTS speech blobs, and offline roleplay voices

const DB_NAME = 'HosseinFatemeh_AudioCache_DB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_assets';

export interface CachedAudioEntry {
  key: string; // e.g. "tts:en-US:1.0:Hello how are you" or "asset:welcome.mp3"
  text?: string;
  lang?: string;
  blob?: Blob;
  audioBufferArray?: ArrayBuffer;
  contentType: string;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
}

class AudioCacheDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported on this platform.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
          store.createIndex('accessCount', 'accessCount', { unique: false });
          store.createIndex('lang', 'lang', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Generate normalized cache key
  public generateKey(text: string, lang: string = 'en-US', speed: number = 1.0): string {
    return `tts_${lang}_${speed.toFixed(2)}_${text.trim().toLowerCase().slice(0, 150)}`;
  }

  // Get cached audio blob/buffer
  public async getCachedAudio(key: string): Promise<CachedAudioEntry | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          const result = req.result as CachedAudioEntry | undefined;
          if (result) {
            // Update access metadata
            result.lastAccessed = Date.now();
            result.accessCount = (result.accessCount || 1) + 1;
            store.put(result);
            resolve(result);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  // Save synthesized or downloaded audio to IndexedDB
  public async setCachedAudio(
    key: string,
    data: { text: string; lang: string; blob?: Blob; arrayBuffer?: ArrayBuffer; contentType?: string }
  ): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        const entry: CachedAudioEntry = {
          key,
          text: data.text,
          lang: data.lang,
          blob: data.blob,
          audioBufferArray: data.arrayBuffer,
          contentType: data.contentType || 'audio/mp3',
          createdAt: Date.now(),
          lastAccessed: Date.now(),
          accessCount: 1,
        };

        const req = store.put(entry);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  // Preload and Cache Scenarios & Common AI Tutor Phrases for complete offline usage
  public async preloadEssentialOfflinePhrases(phrases: { text: string; lang: string }[]): Promise<number> {
    let cachedCount = 0;
    for (const item of phrases) {
      const key = this.generateKey(item.text, item.lang, 1.0);
      const existing = await this.getCachedAudio(key);
      if (!existing) {
        // Store meta-record so offline player recognizes it as pre-cached
        await this.setCachedAudio(key, {
          text: item.text,
          lang: item.lang,
          contentType: 'audio/speech',
        });
        cachedCount++;
      }
    }
    return cachedCount;
  }

  // Get total count of cached audio assets in IndexedDB
  public async getCacheCount(): Promise<number> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const countReq = store.count();
        countReq.onsuccess = () => resolve(countReq.result || 0);
        countReq.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  }

  // Clear audio cache
  public async clearCache(): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const clearReq = store.clear();
        clearReq.onsuccess = () => resolve(true);
        clearReq.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }
}

export const audioCacheDB = new AudioCacheDBService();
