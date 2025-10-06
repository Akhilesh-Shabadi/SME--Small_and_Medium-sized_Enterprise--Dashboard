const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
    getAlerts,
    getAlert,
    createAlert,
    updateAlert,
    deleteAlert,
    acknowledgeAlert,
    getAlertStatistics
} = require('../controllers/alertController');

const router = express.Router();

// Validation rules
const createAlertValidation = [
    body('dataSourceId')
        .isUUID()
        .withMessage('Data source ID must be a valid UUID'),
    body('type')
        .isIn(['threshold', 'anomaly', 'system', 'custom'])
        .withMessage('Type must be one of: threshold, anomaly, system, custom'),
    body('title')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Title must be between 2 and 200 characters'),
    body('message')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters'),
    body('severity')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Severity must be one of: low, medium, high, critical'),
    body('condition')
        .isObject()
        .withMessage('Condition must be an object')
];

const updateAlertValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Title must be between 2 and 200 characters'),
    body('message')
        .optional()
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters'),
    body('severity')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Severity must be one of: low, medium, high, critical'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
    body('condition')
        .optional()
        .isObject()
        .withMessage('Condition must be an object')
];

// Routes
router.get('/', authenticateToken, getAlerts);
router.get('/statistics', authenticateToken, getAlertStatistics);
router.get('/:id', authenticateToken, getAlert);
router.post('/', authenticateToken, createAlertValidation, createAlert);
router.put('/:id', authenticateToken, updateAlertValidation, updateAlert);
router.delete('/:id', authenticateToken, deleteAlert);
router.post('/:id/acknowledge', authenticateToken, acknowledgeAlert);

module.exports = router;
