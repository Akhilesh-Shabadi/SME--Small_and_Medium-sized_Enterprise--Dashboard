const redis = require('redis');
const logger = require('../utils/logger');

// Track error logging to prevent spam
let lastErrorLogTime = 0;
const ERROR_LOG_INTERVAL = 30000; // Log errors only every 30 seconds

const redisClient = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        connectTimeout: 10000, // Increased to 10 seconds
        commandTimeout: 5000,  // Add command timeout
        lazyConnect: true,
        reconnectStrategy: (retries) => {
            if (retries > 3) {
                // Stop trying after 3 attempts to reduce spam
                return false;
            }
            // Exponential backoff: 2s, 4s, 8s
            return Math.min(retries * 2000, 8000);
        }
    },
    password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('connect', () => {
    logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
    const now = Date.now();
    // Only log errors every 30 seconds to prevent spam
    if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
        logger.error('Redis client error:', err);
        lastErrorLogTime = now;
    }
});

redisClient.on('ready', () => {
    logger.info('Redis client ready');
});

redisClient.on('end', () => {
    logger.info('Redis client disconnected');
});

redisClient.on('reconnecting', () => {
    const now = Date.now();
    // Only log reconnection attempts every 30 seconds
    if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
        logger.info('Redis client reconnecting...');
        lastErrorLogTime = now;
    }
});

// Check if Redis is available
const isRedisAvailable = async () => {
    try {
        const net = require('net');
        return new Promise((resolve) => {
            const socket = net.createConnection({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379
            });
            
            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });
            
            socket.on('error', () => {
                resolve(false);
            });
            
            socket.setTimeout(3000, () => {
                socket.destroy();
                resolve(false);
            });
        });
    } catch (error) {
        return false;
    }
};

const connectRedis = async () => {
    // Check if Redis is disabled via environment variable
    if (process.env.REDIS_ENABLED === 'false') {
        logger.info('Redis is disabled via environment variable');
        return;
    }

    // Check if Redis is available before attempting connection
    const isAvailable = await isRedisAvailable();
    if (!isAvailable) {
        logger.warn('Redis server is not available. Running without Redis (caching disabled)');
        return;
    }

    try {
        await redisClient.connect();
        logger.info('Redis connection established successfully');
    } catch (error) {
        const now = Date.now();
        // Only log connection errors every 30 seconds
        if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
            logger.error('Unable to connect to Redis:', error.message);
            lastErrorLogTime = now;
        }
        // Don't exit process for Redis connection failure
        // The app can still work without Redis (with reduced functionality)
    }
};

module.exports = { connectRedis, redisClient };
