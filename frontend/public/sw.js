// Service Worker for SME Dashboard
const CACHE_NAME = 'sme-dashboard-v1';
const STATIC_CACHE = 'sme-dashboard-static-v1';
const DYNAMIC_CACHE = 'sme-dashboard-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/manifest.json',
    '/favicon.ico',
    '/offline.html'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /\/api\/dashboard/,
    /\/api\/analytics/,
    /\/api\/alerts/,
    /\/api\/notifications/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static files');
                // Cache files individually to handle failures gracefully
                return Promise.allSettled(
                    STATIC_FILES.map(url =>
                        cache.add(url).catch(err => {
                            console.warn(`Failed to cache ${url}:`, err);
                            return null;
                        })
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-HTTP(S) requests (chrome-extension, data, blob, etc.)
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Skip cross-origin requests that aren't from our domain
    if (url.origin !== location.origin) {
        return;
    }

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle static files
    if (request.method === 'GET') {
        event.respondWith(handleStaticRequest(request));
        return;
    }

    // For other requests, use network first
    event.respondWith(fetch(request));
});

// Handle API requests with cache-first strategy
async function handleApiRequest(request) {
    const url = new URL(request.url);

    // Check if this is a cacheable API endpoint
    const isCacheable = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));

    if (!isCacheable) {
        return fetch(request);
    }

    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Return cached response and update in background
            updateCacheInBackground(request);
            return cachedResponse;
        }

        // If not in cache, fetch from network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache the response
            try {
                const cache = await caches.open(DYNAMIC_CACHE);
                await cache.put(request, networkResponse.clone());
            } catch (cacheError) {
                console.warn('Failed to cache API response:', cacheError);
            }
        }

        return networkResponse;
    } catch (error) {
        console.log('Network request failed:', error);

        // Return offline fallback if available
        const offlineResponse = await getOfflineResponse(request);
        if (offlineResponse) {
            return offlineResponse;
        }

        throw error;
    }
}

// Handle static file requests with cache-first strategy
async function handleStaticRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // If not in cache, fetch from network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache the response (only for same-origin requests)
            try {
                const cache = await caches.open(STATIC_CACHE);
                await cache.put(request, networkResponse.clone());
            } catch (cacheError) {
                console.warn('Failed to cache response:', cacheError);
            }
        }

        return networkResponse;
    } catch (error) {
        console.log('Static file request failed:', error);

        // Return offline fallback
        const offlineResponse = await getOfflineResponse(request);
        if (offlineResponse) {
            return offlineResponse;
        }

        throw error;
    }
}

// Update cache in background
async function updateCacheInBackground(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            try {
                const cache = await caches.open(DYNAMIC_CACHE);
                await cache.put(request, networkResponse.clone());
            } catch (cacheError) {
                console.warn('Background cache update failed:', cacheError);
            }
        }
    } catch (error) {
        console.log('Background cache update failed:', error);
    }
}

// Get offline response
async function getOfflineResponse(request) {
    const url = new URL(request.url);

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
    }

    // Return cached API response if available
    if (url.pathname.startsWith('/api/')) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
    }

    return null;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Perform background sync
async function doBackgroundSync() {
    try {
        // Get pending actions from IndexedDB
        const pendingActions = await getPendingActions();

        for (const action of pendingActions) {
            try {
                await syncAction(action);
                await removePendingAction(action.id);
            } catch (error) {
                console.log('Failed to sync action:', action, error);
            }
        }
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

// Get pending actions from IndexedDB
async function getPendingActions() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SME_Dashboard', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['pendingActions'], 'readonly');
            const store = transaction.objectStore('pendingActions');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
    });
}

// Sync individual action
async function syncAction(action) {
    const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
    });

    if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
    }

    return response;
}

// Remove pending action from IndexedDB
async function removePendingAction(actionId) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SME_Dashboard', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['pendingActions'], 'readwrite');
            const store = transaction.objectStore('pendingActions');
            const deleteRequest = store.delete(actionId);

            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);

    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Dashboard',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('SME Dashboard', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/dashboard')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker received message:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
