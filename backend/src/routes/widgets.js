const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
    requirePermission,
    PERMISSIONS
} = require('../middleware/rbac');
const {
    getWidgets,
    getWidget,
    createWidget,
    updateWidget,
    deleteWidget,
    getDataSources
} = require('../controllers/widgetController');

const router = express.Router();

// Validation rules
const createWidgetValidation = [
    body('dataSourceId')
        .isUUID()
        .withMessage('Data source ID must be a valid UUID'),
    body('type')
        .isIn(['chart', 'table', 'metric', 'gauge', 'map', 'text'])
        .withMessage('Widget type must be one of: chart, table, metric, gauge, map, text'),
    body('title')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Widget title must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('position')
        .optional()
        .isObject()
        .withMessage('Position must be an object'),
    body('size')
        .optional()
        .isObject()
        .withMessage('Size must be an object'),
    body('config')
        .optional()
        .isObject()
        .withMessage('Config must be an object'),
    body('filters')
        .optional()
        .isObject()
        .withMessage('Filters must be an object'),
    body('refreshInterval')
        .optional()
        .isInt({ min: 5000, max: 3600000 })
        .withMessage('Refresh interval must be between 5 seconds and 1 hour')
];

const updateWidgetValidation = [
    body('dataSourceId')
        .optional()
        .isUUID()
        .withMessage('Data source ID must be a valid UUID'),
    body('type')
        .optional()
        .isIn(['chart', 'table', 'metric', 'gauge', 'map', 'text'])
        .withMessage('Widget type must be one of: chart, table, metric, gauge, map, text'),
    body('title')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Widget title must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('position')
        .optional()
        .isObject()
        .withMessage('Position must be an object'),
    body('size')
        .optional()
        .isObject()
        .withMessage('Size must be an object'),
    body('config')
        .optional()
        .isObject()
        .withMessage('Config must be an object'),
    body('filters')
        .optional()
        .isObject()
        .withMessage('Filters must be an object'),
    body('refreshInterval')
        .optional()
        .isInt({ min: 5000, max: 3600000 })
        .withMessage('Refresh interval must be between 5 seconds and 1 hour'),
    body('isVisible')
        .optional()
        .isBoolean()
        .withMessage('isVisible must be a boolean')
];

// Routes with RBAC
router.get('/data-sources', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_VIEW), getDataSources);
router.get('/dashboard/:dashboardId/widgets', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_VIEW), getWidgets);
router.get('/:id', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_VIEW), getWidget);
router.post('/dashboard/:dashboardId/widgets', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_EDIT), createWidgetValidation, createWidget);
router.put('/:id', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_EDIT), updateWidgetValidation, updateWidget);
router.delete('/:id', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_EDIT), deleteWidget);

module.exports = router;
