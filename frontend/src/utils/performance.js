// Performance optimization utilities

// Debounce function to limit function calls
export const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
};

// Throttle function to limit function calls
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Lazy loading utility
export const lazyLoad = (importFunction) => {
    return React.lazy(importFunction);
};

// Memoization utility
export const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

// Virtual scrolling utility
export const getVisibleItems = (items, scrollTop, itemHeight, containerHeight) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    );

    return {
        items: items.slice(startIndex, endIndex),
        startIndex,
        endIndex,
        totalHeight: items.length * itemHeight
    };
};

// Image optimization utility
export const optimizeImage = (src, width, height, quality = 80) => {
    // In a real app, this would use a service like Cloudinary or ImageKit
    const params = new URLSearchParams({
        w: width.toString(),
        h: height.toString(),
        q: quality.toString(),
        f: 'auto'
    });

    return `${src}?${params.toString()}`;
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
    if (process.env.NODE_ENV === 'development') {
        const stats = {
            totalSize: 0,
            chunks: [],
            assets: []
        };

        // This would be populated by webpack-bundle-analyzer in a real app
        console.log('Bundle analysis:', stats);
        return stats;
    }
};

// Performance monitoring
export const performanceMonitor = {
    // Measure function execution time
    measure: (name, fn) => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    },

    // Measure async function execution time
    measureAsync: async (name, fn) => {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    },

    // Get performance metrics
    getMetrics: () => {
        if (typeof window !== 'undefined' && window.performance) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            return {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
                firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null
            };
        }
        return null;
    }
};

// Memory management
export const memoryManager = {
    // Clear unused data from memory
    cleanup: () => {
        // Clear any cached data that's no longer needed
        if (window.gc) {
            window.gc();
        }
    },

    // Monitor memory usage
    monitor: () => {
        if (performance.memory) {
            const memory = performance.memory;
            const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

            if (usage > 80) {
                console.warn('High memory usage detected:', usage.toFixed(2) + '%');
                memoryManager.cleanup();
            }

            return {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit,
                usage: usage
            };
        }
        return null;
    }
};

// Network optimization
export const networkOptimizer = {
    // Preload critical resources
    preload: (urls) => {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = url.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    },

    // Prefetch resources
    prefetch: (urls) => {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    },

    // Check network status
    isOnline: () => navigator.onLine,

    // Get connection info
    getConnectionInfo: () => {
        if (navigator.connection) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }
        return null;
    }
};

// Cache management
export const cacheManager = {
    // Set cache with expiration
    set: (key, value, expirationMinutes = 60) => {
        const item = {
            value,
            timestamp: Date.now(),
            expiration: expirationMinutes * 60 * 1000
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    // Get cache with expiration check
    get: (key) => {
        try {
            const item = JSON.parse(localStorage.getItem(key));
            if (!item) return null;

            const now = Date.now();
            if (now - item.timestamp > item.expiration) {
                localStorage.removeItem(key);
                return null;
            }

            return item.value;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    },

    // Clear expired cache
    clearExpired: () => {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                cacheManager.get(key); // This will remove expired items
            }
        });
    },

    // Clear all cache
    clear: () => {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        });
    }
};

// Component optimization utilities
export const componentOptimizer = {
    // Create optimized component wrapper
    createOptimizedComponent: (Component, options = {}) => {
        const {
            memo = true,
            forwardRef = false,
            displayName = Component.displayName || Component.name
        } = options;

        let OptimizedComponent = Component;

        if (memo) {
            OptimizedComponent = React.memo(OptimizedComponent);
        }

        if (forwardRef) {
            OptimizedComponent = React.forwardRef(OptimizedComponent);
        }

        OptimizedComponent.displayName = displayName;

        return OptimizedComponent;
    },

    // Create virtualized list component
    createVirtualizedList: (items, itemHeight, containerHeight) => {
        const [scrollTop, setScrollTop] = React.useState(0);

        const visibleItems = getVisibleItems(items, scrollTop, itemHeight, containerHeight);

        const handleScroll = throttle((e) => {
            setScrollTop(e.target.scrollTop);
        }, 16);

        return {
            visibleItems,
            handleScroll,
            totalHeight: visibleItems.totalHeight
        };
    }
};

// Export all utilities
export default {
    debounce,
    throttle,
    lazyLoad,
    memoize,
    getVisibleItems,
    optimizeImage,
    analyzeBundleSize,
    performanceMonitor,
    memoryManager,
    networkOptimizer,
    cacheManager,
    componentOptimizer
};
