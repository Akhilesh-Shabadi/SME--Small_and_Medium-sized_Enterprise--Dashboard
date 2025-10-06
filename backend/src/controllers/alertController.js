const { Alert, User, DataSource } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const alertService = require('../services/alertService');

// @desc    Get all alerts for user
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
    try {
        const { status, severity, type, page = 1, limit = 10 } = req.query;
        const userId = req.user.id;

        let whereClause = { userId };

        if (status) {
            whereClause.isTriggered = status === 'triggered';
        }

        if (severity) {
            whereClause.severity = severity;
        }

        if (type) {
            whereClause.type = type;
        }

        const offset = (page - 1) * limit;

        const { count, rows: alerts } = await Alert.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }, {
                model: DataSource,
                as: 'dataSource',
                attributes: ['id', 'name', 'type']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                alerts,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alerts'
        });
    }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Private
const getAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const alert = await Alert.findOne({
            where: { id, userId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }, {
                model: DataSource,
                as: 'dataSource',
                attributes: ['id', 'name', 'type']
            }]
        });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({
            success: true,
            data: { alert }
        });
    } catch (error) {
        logger.error('Error fetching alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alert'
        });
    }
};

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            dataSourceId,
            type,
            title,
            message,
            severity,
            condition
        } = req.body;
        const userId = req.user.id;

        const alert = await alertService.createAlert({
            userId,
            dataSourceId,
            type,
            title,
            message,
            severity: severity || 'medium',
            condition,
            isActive: true,
            isTriggered: false
        });

        res.status(201).json({
            success: true,
            message: 'Alert created successfully',
            data: { alert }
        });
    } catch (error) {
        logger.error('Error creating alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create alert'
        });
    }
};

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private
const updateAlert = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const userId = req.user.id;
        const updateData = req.body;

        const alert = await Alert.findOne({
            where: { id, userId }
        });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        const updatedAlert = await alertService.updateAlert(id, updateData);

        res.json({
            success: true,
            message: 'Alert updated successfully',
            data: { alert: updatedAlert }
        });
    } catch (error) {
        logger.error('Error updating alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update alert'
        });
    }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private
const deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const alert = await Alert.findOne({
            where: { id, userId }
        });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        await alertService.deleteAlert(id);

        res.json({
            success: true,
            message: 'Alert deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete alert'
        });
    }
};

// @desc    Acknowledge alert
// @route   POST /api/alerts/:id/acknowledge
// @access  Private
const acknowledgeAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const alert = await Alert.findOne({
            where: { id, userId }
        });

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        const updatedAlert = await alertService.acknowledgeAlert(id, userId);

        res.json({
            success: true,
            message: 'Alert acknowledged successfully',
            data: { alert: updatedAlert }
        });
    } catch (error) {
        logger.error('Error acknowledging alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to acknowledge alert'
        });
    }
};

// @desc    Get alert statistics
// @route   GET /api/alerts/statistics
// @access  Private
const getAlertStatistics = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await Alert.findAll({
            where: { userId },
            attributes: [
                'severity',
                'isTriggered',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['severity', 'isTriggered'],
            raw: true
        });

        const statistics = {
            total: 0,
            triggered: 0,
            acknowledged: 0,
            bySeverity: {
                low: 0,
                medium: 0,
                high: 0,
                critical: 0
            },
            byType: {}
        };

        stats.forEach(stat => {
            statistics.total += parseInt(stat.count);
            if (stat.isTriggered) {
                statistics.triggered += parseInt(stat.count);
            }
            if (stat.acknowledgedAt) {
                statistics.acknowledged += parseInt(stat.count);
            }
            statistics.bySeverity[stat.severity] += parseInt(stat.count);
        });

        res.json({
            success: true,
            data: { statistics }
        });
    } catch (error) {
        logger.error('Error fetching alert statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alert statistics'
        });
    }
};

module.exports = {
    getAlerts,
    getAlert,
    createAlert,
    updateAlert,
    deleteAlert,
    acknowledgeAlert,
    getAlertStatistics
};
