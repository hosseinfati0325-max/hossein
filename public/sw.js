// Service Worker for "حسین و فاطمه - آموزش زبان هوشمند" PWA
const CACHE_NAME = 'hossein-fatemeh-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

// Install Event: cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Stale-While-Revalidate for app shell & static assets, Network-First for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude API requests from static cache (they have their own in-app offline queue)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Audio / fonts / static assets cache strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting navigation, return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

// ==========================================
// 1. PUSH NOTIFICATIONS & LOCAL NOTIFICATIONS
// ==========================================
self.addEventListener('push', (event) => {
  let data = {
    title: '🔔 یادآور هوشمند زبان‌آموز',
    body: 'زمان تمرین امروز شما فرا رسیده است! با ۵ دقیقه تمرین استریک خود را حفظ کنید.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'daily-reminder',
    data: { url: '/?tab=learn' },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/' },
    actions: [
      { action: 'open_lesson', title: '🚀 شروع درس ۵۲ هفته' },
      { action: 'open_flashcards', title: '🃏 مرور لایتنر' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click Handler: Focus tab or open specific view
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let targetUrl = '/';
  if (event.action === 'open_flashcards') {
    targetUrl = '/?tab=flashcards';
  } else if (event.action === 'open_lesson') {
    targetUrl = '/?tab=learn';
  } else if (event.notification.data && event.notification.data.url) {
    targetUrl = event.notification.data.url;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and post navigation message
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE_TAB', tab: targetUrl.split('=')[1] || 'learn' });
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ==========================================
// 2. BACKGROUND SYNC API (Offline Sync Engine)
// ==========================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress' || event.tag === 'sync-offline-data') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        // Notify all open clients to perform background flush
        clients.forEach((client) => {
          client.postMessage({ type: 'EXECUTE_BACKGROUND_SYNC', timestamp: Date.now() });
        });
      })
    );
  }
});

// Periodic Background Sync (if supported by modern Chrome/Android)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder-sync') {
    event.waitUntil(
      self.registration.showNotification('🔥 استریک تمرین امروز شما منتظر است!', {
        body: 'یادگیری مستمر کلید تسلط به زبان است. درس امروز خود را در اپلیکیشن تکمیل کنید.',
        icon: '/icon.svg',
        tag: 'daily-streak-reminder',
        data: { url: '/?tab=learn' },
      })
    );
  }
});
