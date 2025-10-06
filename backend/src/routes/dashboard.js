const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorize } = require('../middleware/auth');
const {
    requirePermission,
    PERMISSIONS
} = require('../middleware/rbac');
const {
    getDashboards,
    getDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    duplicateDashboard
} = require('../controllers/dashboardController');

const router = express.Router();

// Validation rules
const createDashboardValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Dashboard name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean'),
    body('layout')
        .optional()
        .isObject()
        .withMessage('Layout must be an object'),
    body('settings')
        .optional()
        .isObject()
        .withMessage('Settings must be an object')
];

const updateDashboardValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Dashboard name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean'),
    body('layout')
        .optional()
        .isObject()
        .withMessage('Layout must be an object'),
    body('settings')
        .optional()
        .isObject()
        .withMessage('Settings must be an object')
];

// Routes with RBAC
router.get('/', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_VIEW), getDashboards);
router.get('/:id', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_VIEW), getDashboard);
router.post('/', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_CREATE), createDashboardValidation, createDashboard);
router.put('/:id', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_EDIT), updateDashboardValidation, updateDashboard);
router.delete('/:id', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_DELETE), deleteDashboard);
router.post('/:id/duplicate', authenticateToken, requirePermission(PERMISSIONS.DASHBOARD_CREATE), duplicateDashboard);

module.exports = router;
