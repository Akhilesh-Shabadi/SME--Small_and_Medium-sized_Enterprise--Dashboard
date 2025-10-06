const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationStatistics,
    createNotification
} = require('../controllers/notificationController');

const router = express.Router();

// Validation rules
const createNotificationValidation = [
    body('userId')
        .isUUID()
        .withMessage('User ID must be a valid UUID'),
    body('type')
        .isIn(['alert', 'task', 'comment', 'system', 'collaboration'])
        .withMessage('Type must be one of: alert, task, comment, system, collaboration'),
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    body('message')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters'),
    body('actionUrl')
        .optional()
        .isURL()
        .withMessage('Action URL must be a valid URL'),
    body('metadata')
        .optional()
        .isObject()
        .withMessage('Metadata must be an object')
];

// Routes
router.get('/', authenticateToken, getNotifications);
router.get('/statistics', authenticateToken, getNotificationStatistics);
router.put('/:id/read', authenticateToken, markAsRead);
router.put('/read-all', authenticateToken, markAllAsRead);
router.delete('/:id', authenticateToken, deleteNotification);
router.post('/', authenticateToken, createNotificationValidation, createNotification);

module.exports = router;
