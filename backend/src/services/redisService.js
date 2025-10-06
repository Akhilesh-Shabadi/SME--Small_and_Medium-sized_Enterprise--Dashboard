const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');

class RedisService {
    constructor() {
        this.isConnected = false;
        this.checkConnection();
    }

    async checkConnection() {
        try {
            if (redisClient && redisClient.isOpen) {
                await redisClient.ping();
                this.isConnected = true;
            } else {
                this.isConnected = false;
            }
        } catch (error) {
            this.isConnected = false;
        }
    }

    async get(key) {
        if (!this.isConnected) {
            logger.debug('Redis not connected, skipping get operation');
            return null;
        }

        try {
            await this.checkConnection();
            if (!this.isConnected) return null;

            const value = await redisClient.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error('Redis get error:', error.message);
            this.isConnected = false;
            return null;
        }
    }

    async set(key, value, ttl = 3600) {
        if (!this.isConnected) {
            logger.debug('Redis not connected, skipping set operation');
            return false;
        }

        try {
            await this.checkConnection();
            if (!this.isConnected) return false;

            await redisClient.setEx(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error('Redis set error:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    async del(key) {
        if (!this.isConnected) {
            logger.debug('Redis not connected, skipping delete operation');
            return false;
        }

        try {
            await this.checkConnection();
            if (!this.isConnected) return false;

            await redisClient.del(key);
            return true;
        } catch (error) {
            logger.error('Redis delete error:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    async exists(key) {
        if (!this.isConnected) {
            logger.debug('Redis not connected, skipping exists check');
            return false;
        }

        try {
            await this.checkConnection();
            if (!this.isConnected) return false;

            const result = await redisClient.exists(key);
            return result === 1;
        } catch (error) {
            logger.error('Redis exists error:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    async flushAll() {
        if (!this.isConnected) {
            logger.debug('Redis not connected, skipping flush operation');
            return false;
        }

        try {
            await this.checkConnection();
            if (!this.isConnected) return false;

            await redisClient.flushAll();
            return true;
        } catch (error) {
            logger.error('Redis flush error:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    // Health check method
    async healthCheck() {
        try {
            if (redisClient && redisClient.isOpen) {
                await redisClient.ping();
                this.isConnected = true;
                return { status: 'healthy', connected: true };
            } else {
                this.isConnected = false;
                return { status: 'unhealthy', connected: false, reason: 'Redis client not open' };
            }
        } catch (error) {
            this.isConnected = false;
            return { status: 'unhealthy', connected: false, reason: error.message };
        }
    }
}

module.exports = new RedisService();
