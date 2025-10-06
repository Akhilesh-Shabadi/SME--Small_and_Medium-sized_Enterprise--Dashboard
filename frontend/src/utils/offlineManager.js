// Offline data management utilities

class OfflineManager {
    constructor() {
        this.dbName = 'SME_Dashboard';
        this.dbVersion = 1;
        this.db = null;
        this.isOnline = navigator.onLine;
        this.pendingActions = [];

        this.init();
        this.setupEventListeners();
    }

    // Initialize IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('pendingActions')) {
                    const pendingStore = db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
                    pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains('cachedData')) {
                    const cacheStore = db.createObjectStore('cachedData', { keyPath: 'key' });
                    cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains('userData')) {
                    const userStore = db.createObjectStore('userData', { keyPath: 'key' });
                }
            };
        });
    }

    // Setup event listeners
    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingActions();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Periodic sync when online
        setInterval(() => {
            if (this.isOnline) {
                this.syncPendingActions();
            }
        }, 30000); // Sync every 30 seconds
    }

    // Store data for offline access
    async storeData(key, data, expirationMinutes = 60) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['cachedData'], 'readwrite');
        const store = transaction.objectStore('cachedData');

        const item = {
            key,
            data,
            timestamp: Date.now(),
            expiration: expirationMinutes * 60 * 1000
        };

        return new Promise((resolve, reject) => {
            const request = store.put(item);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Retrieve cached data
    async getData(key) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['cachedData'], 'readonly');
        const store = transaction.objectStore('cachedData');

        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => {
                const item = request.result;
                if (!item) {
                    resolve(null);
                    return;
                }

                // Check expiration
                const now = Date.now();
                if (now - item.timestamp > item.expiration) {
                    this.removeData(key);
                    resolve(null);
                    return;
                }

                resolve(item.data);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Remove cached data
    async removeData(key) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['cachedData'], 'readwrite');
        const store = transaction.objectStore('cachedData');

        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Store pending action for later sync
    async storePendingAction(action) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['pendingActions'], 'readwrite');
        const store = transaction.objectStore('pendingActions');

        const pendingAction = {
            ...action,
            timestamp: Date.now(),
            retryCount: 0
        };

        return new Promise((resolve, reject) => {
            const request = store.add(pendingAction);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Get all pending actions
    async getPendingActions() {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['pendingActions'], 'readonly');
        const store = transaction.objectStore('pendingActions');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Remove pending action
    async removePendingAction(id) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['pendingActions'], 'readwrite');
        const store = transaction.objectStore('pendingActions');

        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Sync pending actions when online
    async syncPendingActions() {
        if (!this.isOnline) return;

        const pendingActions = await this.getPendingActions();

        for (const action of pendingActions) {
            try {
                await this.syncAction(action);
                await this.removePendingAction(action.id);
            } catch (error) {
                console.error('Failed to sync action:', action, error);

                // Increment retry count
                action.retryCount = (action.retryCount || 0) + 1;

                // Remove if too many retries
                if (action.retryCount > 3) {
                    await this.removePendingAction(action.id);
                }
            }
        }
    }

    // Sync individual action
    async syncAction(action) {
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

    // Make API request with offline support
    async makeRequest(url, options = {}) {
        const { method = 'GET', body, headers = {} } = options;

        if (this.isOnline) {
            try {
                const response = await fetch(url, { method, body, headers });

                if (response.ok) {
                    // Cache successful responses
                    const data = await response.json();
                    await this.storeData(url, data);
                    return { data, fromCache: false };
                }

                throw new Error(`Request failed: ${response.status}`);
            } catch (error) {
                console.error('Online request failed:', error);
                // Fall back to cached data
                const cachedData = await this.getData(url);
                if (cachedData) {
                    return { data: cachedData, fromCache: true };
                }
                throw error;
            }
        } else {
            // Offline mode - try to get cached data
            const cachedData = await this.getData(url);
            if (cachedData) {
                return { data: cachedData, fromCache: true };
            }

            // If no cached data and it's a write operation, queue it
            if (method !== 'GET') {
                await this.storePendingAction({ url, method, body, headers });
                return { data: null, queued: true };
            }

            throw new Error('No cached data available and offline');
        }
    }

    // Clear expired data
    async clearExpiredData() {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['cachedData'], 'readwrite');
        const store = transaction.objectStore('cachedData');

        const request = store.getAll();
        request.onsuccess = () => {
            const items = request.result;
            const now = Date.now();

            items.forEach(item => {
                if (now - item.timestamp > item.expiration) {
                    store.delete(item.key);
                }
            });
        };
    }

    // Get storage usage
    async getStorageUsage() {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['cachedData', 'pendingActions'], 'readonly');
        const cacheStore = transaction.objectStore('cachedData');
        const pendingStore = transaction.objectStore('pendingActions');

        const cacheCount = await new Promise((resolve) => {
            const request = cacheStore.count();
            request.onsuccess = () => resolve(request.result);
        });

        const pendingCount = await new Promise((resolve) => {
            const request = pendingStore.count();
            request.onsuccess = () => resolve(request.result);
        });

        return {
            cachedItems: cacheCount,
            pendingActions: pendingCount,
            isOnline: this.isOnline
        };
    }

    // Export data for backup
    async exportData() {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['cachedData', 'pendingActions', 'userData'], 'readonly');
        const cacheStore = transaction.objectStore('cachedData');
        const pendingStore = transaction.objectStore('pendingActions');
        const userStore = transaction.objectStore('userData');

        const [cachedData, pendingActions, userData] = await Promise.all([
            new Promise((resolve) => {
                const request = cacheStore.getAll();
                request.onsuccess = () => resolve(request.result);
            }),
            new Promise((resolve) => {
                const request = pendingStore.getAll();
                request.onsuccess = () => resolve(request.result);
            }),
            new Promise((resolve) => {
                const request = userStore.getAll();
                request.onsuccess = () => resolve(request.result);
            })
        ]);

        return {
            cachedData,
            pendingActions,
            userData,
            exportDate: new Date().toISOString()
        };
    }

    // Import data from backup
    async importData(data) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['cachedData', 'pendingActions', 'userData'], 'readwrite');
        const cacheStore = transaction.objectStore('cachedData');
        const pendingStore = transaction.objectStore('pendingActions');
        const userStore = transaction.objectStore('userData');

        // Clear existing data
        await Promise.all([
            new Promise((resolve) => {
                const request = cacheStore.clear();
                request.onsuccess = () => resolve();
            }),
            new Promise((resolve) => {
                const request = pendingStore.clear();
                request.onsuccess = () => resolve();
            }),
            new Promise((resolve) => {
                const request = userStore.clear();
                request.onsuccess = () => resolve();
            })
        ]);

        // Import new data
        if (data.cachedData) {
            for (const item of data.cachedData) {
                cacheStore.add(item);
            }
        }

        if (data.pendingActions) {
            for (const action of data.pendingActions) {
                pendingStore.add(action);
            }
        }

        if (data.userData) {
            for (const item of data.userData) {
                userStore.add(item);
            }
        }
    }
}

// Create singleton instance
const offlineManager = new OfflineManager();

export default offlineManager;
