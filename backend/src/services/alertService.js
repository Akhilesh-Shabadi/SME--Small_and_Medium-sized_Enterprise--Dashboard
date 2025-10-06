const cron = require('node-cron');
const { Alert, SalesData, InventoryData, CustomerFeedback, User } = require('../models');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');

class AlertService {
    constructor() {
        this.isRunning = false;
        this.alertJob = null;
    }

    // Start alert service
    start() {
        if (this.isRunning) {
            logger.warn('Alert service is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting alert service');

        // Start cron job to check alerts every minute
        this.alertJob = cron.schedule('* * * * *', async () => {
            try {
                await this.checkAllAlerts();
            } catch (error) {
                logger.error('Error in alert checking:', error);
            }
        });
    }

    // Stop alert service
    stop() {
        if (!this.isRunning) {
            logger.warn('Alert service is not running');
            return;
        }

        this.isRunning = false;

        if (this.alertJob) {
            this.alertJob.destroy();
            this.alertJob = null;
        }

        logger.info('Alert service stopped');
    }

    // Check all active alerts
    async checkAllAlerts() {
        try {
            const alerts = await Alert.findAll({
                where: {
                    isActive: true,
                    isTriggered: false
                },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }]
            });

            for (const alert of alerts) {
                await this.checkAlert(alert);
            }
        } catch (error) {
            logger.error('Error checking alerts:', error);
        }
    }

    // Check specific alert
    async checkAlert(alert) {
        try {
            const { condition, dataSourceId, type } = alert;
            let shouldTrigger = false;
            let alertData = null;

            switch (type) {
                case 'threshold':
                    shouldTrigger = await this.checkThresholdAlert(alert, condition);
                    break;
                case 'anomaly':
                    shouldTrigger = await this.checkAnomalyAlert(alert, condition);
                    break;
                case 'system':
                    shouldTrigger = await this.checkSystemAlert(alert, condition);
                    break;
                case 'custom':
                    shouldTrigger = await this.checkCustomAlert(alert, condition);
                    break;
                default:
                    logger.warn(`Unknown alert type: ${type}`);
                    return;
            }

            if (shouldTrigger) {
                await this.triggerAlert(alert, alertData);
            }
        } catch (error) {
            logger.error(`Error checking alert ${alert.id}:`, error);
        }
    }

    // Check threshold alert
    async checkThresholdAlert(alert, condition) {
        const { dataSourceId, condition: alertCondition } = alert;
        const { metric, operator, value, timeWindow } = condition;

        try {
            let currentValue = 0;
            let threshold = value;

            // Get current value based on metric
            switch (metric) {
                case 'inventory_level':
                    currentValue = await this.getCurrentInventoryLevel(dataSourceId, alertCondition.productId);
                    break;
                case 'sales_amount':
                    currentValue = await this.getCurrentSalesAmount(dataSourceId, timeWindow);
                    break;
                case 'customer_rating':
                    currentValue = await this.getCurrentCustomerRating(dataSourceId, timeWindow);
                    break;
                case 'low_stock_count':
                    currentValue = await this.getLowStockCount(dataSourceId);
                    break;
                default:
                    logger.warn(`Unknown metric: ${metric}`);
                    return false;
            }

            // Check condition
            switch (operator) {
                case 'less_than':
                    return currentValue < threshold;
                case 'less_than_or_equal':
                    return currentValue <= threshold;
                case 'greater_than':
                    return currentValue > threshold;
                case 'greater_than_or_equal':
                    return currentValue >= threshold;
                case 'equals':
                    return currentValue === threshold;
                case 'not_equals':
                    return currentValue !== threshold;
                default:
                    logger.warn(`Unknown operator: ${operator}`);
                    return false;
            }
        } catch (error) {
            logger.error(`Error checking threshold alert:`, error);
            return false;
        }
    }

    // Check anomaly alert
    async checkAnomalyAlert(alert, condition) {
        const { dataSourceId, condition: alertCondition } = alert;
        const { metric, threshold, timeWindow } = condition;

        try {
            let currentValue = 0;
            let historicalAverage = 0;

            // Get current and historical values
            switch (metric) {
                case 'sales_amount':
                    currentValue = await this.getCurrentSalesAmount(dataSourceId, timeWindow);
                    historicalAverage = await this.getHistoricalSalesAverage(dataSourceId, timeWindow);
                    break;
                case 'inventory_level':
                    currentValue = await this.getCurrentInventoryLevel(dataSourceId, alertCondition.productId);
                    historicalAverage = await this.getHistoricalInventoryAverage(dataSourceId, alertCondition.productId, timeWindow);
                    break;
                default:
                    logger.warn(`Unknown metric for anomaly detection: ${metric}`);
                    return false;
            }

            // Calculate deviation percentage
            const deviation = Math.abs(currentValue - historicalAverage) / historicalAverage;
            return deviation > threshold;
        } catch (error) {
            logger.error(`Error checking anomaly alert:`, error);
            return false;
        }
    }

    // Check system alert
    async checkSystemAlert(alert, condition) {
        const { metric, threshold } = condition;

        try {
            switch (metric) {
                case 'data_sync_failure':
                    return await this.checkDataSyncFailures(threshold);
                case 'high_error_rate':
                    return await this.checkErrorRate(threshold);
                case 'low_disk_space':
                    return await this.checkDiskSpace(threshold);
                default:
                    logger.warn(`Unknown system metric: ${metric}`);
                    return false;
            }
        } catch (error) {
            logger.error(`Error checking system alert:`, error);
            return false;
        }
    }

    // Check custom alert
    async checkCustomAlert(alert, condition) {
        // This would be implemented based on specific business logic
        // For now, return false
        return false;
    }

    // Get current inventory level
    async getCurrentInventoryLevel(dataSourceId, productId) {
        const whereClause = { dataSourceId };
        if (productId) {
            whereClause.productId = productId;
        }

        const inventory = await InventoryData.findOne({
            where: whereClause,
            order: [['timestamp', 'DESC']]
        });

        return inventory ? inventory.currentStock : 0;
    }

    // Get current sales amount
    async getCurrentSalesAmount(dataSourceId, timeWindow) {
        const timeWindowMs = this.parseTimeWindow(timeWindow);
        const startTime = new Date(Date.now() - timeWindowMs);

        const result = await SalesData.findOne({
            where: {
                dataSourceId,
                timestamp: {
                    [require('sequelize').Op.gte]: startTime
                }
            },
            attributes: [
                [require('sequelize').fn('SUM', require('sequelize').col('totalAmount')), 'total']
            ],
            raw: true
        });

        return parseFloat(result?.total || 0);
    }

    // Get current customer rating
    async getCurrentCustomerRating(dataSourceId, timeWindow) {
        const timeWindowMs = this.parseTimeWindow(timeWindow);
        const startTime = new Date(Date.now() - timeWindowMs);

        const result = await CustomerFeedback.findOne({
            where: {
                dataSourceId,
                timestamp: {
                    [require('sequelize').Op.gte]: startTime
                }
            },
            attributes: [
                [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'average']
            ],
            raw: true
        });

        return parseFloat(result?.average || 0);
    }

    // Get low stock count
    async getLowStockCount(dataSourceId) {
        const count = await InventoryData.count({
            where: {
                dataSourceId,
                status: 'low_stock'
            }
        });

        return count;
    }

    // Get historical sales average
    async getHistoricalSalesAverage(dataSourceId, timeWindow) {
        const timeWindowMs = this.parseTimeWindow(timeWindow);
        const startTime = new Date(Date.now() - (timeWindowMs * 2)); // Double the time window for historical data
        const endTime = new Date(Date.now() - timeWindowMs);

        const result = await SalesData.findOne({
            where: {
                dataSourceId,
                timestamp: {
                    [require('sequelize').Op.between]: [startTime, endTime]
                }
            },
            attributes: [
                [require('sequelize').fn('AVG', require('sequelize').col('totalAmount')), 'average']
            ],
            raw: true
        });

        return parseFloat(result?.average || 0);
    }

    // Get historical inventory average
    async getHistoricalInventoryAverage(dataSourceId, productId, timeWindow) {
        const timeWindowMs = this.parseTimeWindow(timeWindow);
        const startTime = new Date(Date.now() - (timeWindowMs * 2));

        const whereClause = {
            dataSourceId,
            timestamp: {
                [require('sequelize').Op.gte]: startTime
            }
        };

        if (productId) {
            whereClause.productId = productId;
        }

        const result = await InventoryData.findOne({
            where: whereClause,
            attributes: [
                [require('sequelize').fn('AVG', require('sequelize').col('currentStock')), 'average']
            ],
            raw: true
        });

        return parseFloat(result?.average || 0);
    }

    // Check data sync failures
    async checkDataSyncFailures(threshold) {
        // This would check the actual sync status from data sources
        // For now, return false
        return false;
    }

    // Check error rate
    async checkErrorRate(threshold) {
        // This would check application error rates
        // For now, return false
        return false;
    }

    // Check disk space
    async checkDiskSpace(threshold) {
        // This would check actual disk space
        // For now, return false
        return false;
    }

    // Parse time window string to milliseconds
    parseTimeWindow(timeWindow) {
        const timeWindowStr = timeWindow || '1h';
        const match = timeWindowStr.match(/^(\d+)([smhd])$/);

        if (!match) {
            return 3600000; // Default 1 hour
        }

        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 3600000;
        }
    }

    // Trigger alert
    async triggerAlert(alert, alertData) {
        try {
            // Update alert status
            await alert.update({
                isTriggered: true,
                triggeredAt: new Date()
            });

            // Create notification
            const notification = {
                userId: alert.userId,
                type: 'alert',
                title: alert.title,
                message: alert.message,
                actionUrl: `/dashboard/alerts/${alert.id}`,
                metadata: {
                    alertId: alert.id,
                    alertType: alert.type,
                    severity: alert.severity,
                    data: alertData
                }
            };

            // Publish to Redis for real-time notification
            if (redisClient.isOpen) {
                await redisClient.publish('notification:new', JSON.stringify(notification));
            }

            logger.info(`Alert triggered: ${alert.title} for user ${alert.user.email}`);
        } catch (error) {
            logger.error(`Error triggering alert ${alert.id}:`, error);
        }
    }

    // Create new alert
    async createAlert(alertData) {
        try {
            const alert = await Alert.create(alertData);
            logger.info(`Alert created: ${alert.title}`);
            return alert;
        } catch (error) {
            logger.error('Error creating alert:', error);
            throw error;
        }
    }

    // Update alert
    async updateAlert(alertId, updateData) {
        try {
            const alert = await Alert.findByPk(alertId);
            if (!alert) {
                throw new Error('Alert not found');
            }

            await alert.update(updateData);
            logger.info(`Alert updated: ${alert.title}`);
            return alert;
        } catch (error) {
            logger.error(`Error updating alert ${alertId}:`, error);
            throw error;
        }
    }

    // Delete alert
    async deleteAlert(alertId) {
        try {
            const alert = await Alert.findByPk(alertId);
            if (!alert) {
                throw new Error('Alert not found');
            }

            await alert.destroy();
            logger.info(`Alert deleted: ${alert.title}`);
        } catch (error) {
            logger.error(`Error deleting alert ${alertId}:`, error);
            throw error;
        }
    }

    // Acknowledge alert
    async acknowledgeAlert(alertId, acknowledgedBy) {
        try {
            const alert = await Alert.findByPk(alertId);
            if (!alert) {
                throw new Error('Alert not found');
            }

            await alert.update({
                acknowledgedAt: new Date(),
                acknowledgedBy
            });

            logger.info(`Alert acknowledged: ${alert.title} by user ${acknowledgedBy}`);
            return alert;
        } catch (error) {
            logger.error(`Error acknowledging alert ${alertId}:`, error);
            throw error;
        }
    }
}

module.exports = new AlertService();
