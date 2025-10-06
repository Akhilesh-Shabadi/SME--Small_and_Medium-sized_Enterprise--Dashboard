const { Notification, User } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const { isRead, type, page = 1, limit = 20 } = req.query;
        const userId = req.user.id;

        let whereClause = { userId };

        if (isRead !== undefined) {
            whereClause.isRead = isRead === 'true';
        }

        if (type) {
            whereClause.type = type;
        }

        const offset = (page - 1) * limit;

        const { count, rows: notifications } = await Notification.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            where: { id, userId }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await notification.update({
            isRead: true,
            readAt: new Date()
        });

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        logger.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.update(
            {
                isRead: true,
                readAt: new Date()
            },
            {
                where: {
                    userId,
                    isRead: false
                }
            }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        logger.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read'
        });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            where: { id, userId }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await notification.destroy();

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/statistics
// @access  Private
const getNotificationStatistics = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await Notification.findAll({
            where: { userId },
            attributes: [
                'type',
                'isRead',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['type', 'isRead'],
            raw: true
        });

        const statistics = {
            total: 0,
            unread: 0,
            byType: {
                alert: 0,
                task: 0,
                comment: 0,
                system: 0,
                collaboration: 0
            }
        };

        stats.forEach(stat => {
            statistics.total += parseInt(stat.count);
            if (!stat.isRead) {
                statistics.unread += parseInt(stat.count);
            }
            statistics.byType[stat.type] += parseInt(stat.count);
        });

        res.json({
            success: true,
            data: { statistics }
        });
    } catch (error) {
        logger.error('Error fetching notification statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification statistics'
        });
    }
};

// @desc    Create notification (internal use)
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
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
            userId,
            type,
            title,
            message,
            actionUrl,
            metadata
        } = req.body;

        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            actionUrl,
            metadata: metadata || {},
            isRead: false
        });

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: { notification }
        });
    } catch (error) {
        logger.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification'
        });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationStatistics,
    createNotification
};
