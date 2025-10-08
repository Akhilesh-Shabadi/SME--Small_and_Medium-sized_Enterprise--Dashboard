const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
    requirePermission,
    PERMISSIONS
} = require('../middleware/rbac');
const {
    getDataSources,
    getDataSource,
    createDataSource,
    updateDataSource,
    deleteDataSource,
    testDataSource,
    syncDataSource
} = require('../controllers/dataSourceController');

const router = express.Router();

// Validation rules
const createDataSourceValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Data source name must be between 2 and 100 characters'),
    body('type')
        .isIn(['pos', 'ecommerce', 'inventory', 'feedback', 'api', 'file'])
        .withMessage('Data source type must be one of: pos, ecommerce, inventory, feedback, api, file'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('connectionConfig')
        .optional()
        .isObject()
        .withMessage('Connection config must be an object'),
    body('dataSchema')
        .optional()
        .isObject()
        .withMessage('Data schema must be an object'),
    body('refreshInterval')
        .optional()
        .isInt({ min: 10000, max: 3600000 })
        .withMessage('Refresh interval must be between 10 seconds and 1 hour')
];

const updateDataSourceValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Data source name must be between 2 and 100 characters'),
    body('type')
        .optional()
        .isIn(['pos', 'ecommerce', 'inventory', 'feedback', 'api', 'file'])
        .withMessage('Data source type must be one of: pos, ecommerce, inventory, feedback, api, file'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('connectionConfig')
        .optional()
        .isObject()
        .withMessage('Connection config must be an object'),
    body('dataSchema')
        .optional()
        .isObject()
        .withMessage('Data schema must be an object'),
    body('refreshInterval')
        .optional()
        .isInt({ min: 10000, max: 3600000 })
        .withMessage('Refresh interval must be between 10 seconds and 1 hour'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean')
];

// Routes with RBAC
router.get('/', authenticateToken, requirePermission(PERMISSIONS.DATA_VIEW), getDataSources);
router.get('/:id', authenticateToken, requirePermission(PERMISSIONS.DATA_VIEW), getDataSource);
router.post('/', authenticateToken, requirePermission(PERMISSIONS.DATA_INGEST), createDataSourceValidation, createDataSource);
router.put('/:id', authenticateToken, requirePermission(PERMISSIONS.DATA_INGEST), updateDataSourceValidation, updateDataSource);
router.delete('/:id', authenticateToken, requirePermission(PERMISSIONS.DATA_INGEST), deleteDataSource);
router.post('/:id/test', authenticateToken, requirePermission(PERMISSIONS.DATA_INGEST), testDataSource);
router.post('/:id/sync', authenticateToken, requirePermission(PERMISSIONS.DATA_INGEST), syncDataSource);

module.exports = router;
