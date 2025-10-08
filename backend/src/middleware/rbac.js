const logger = require('../utils/logger');

// Role definitions
const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    EMPLOYEE: 'employee'
};

// Permission definitions
const PERMISSIONS = {
    // Dashboard permissions
    DASHBOARD_VIEW: 'dashboard:view',
    DASHBOARD_CREATE: 'dashboard:create',
    DASHBOARD_EDIT: 'dashboard:edit',
    DASHBOARD_DELETE: 'dashboard:delete',

    // Analytics permissions
    ANALYTICS_VIEW: 'analytics:view',
    ANALYTICS_EXPORT: 'analytics:export',

    // Collaboration permissions
    COMMENTS_VIEW: 'comments:view',
    COMMENTS_CREATE: 'comments:create',
    COMMENTS_EDIT: 'comments:edit',
    COMMENTS_DELETE: 'comments:delete',

    TASKS_VIEW: 'tasks:view',
    TASKS_CREATE: 'tasks:create',
    TASKS_EDIT: 'tasks:edit',
    TASKS_DELETE: 'tasks:delete',
    TASKS_ASSIGN: 'tasks:assign',

    // Alert permissions
    ALERTS_VIEW: 'alerts:view',
    ALERTS_CREATE: 'alerts:create',
    ALERTS_EDIT: 'alerts:edit',
    ALERTS_DELETE: 'alerts:delete',
    ALERTS_ACKNOWLEDGE: 'alerts:acknowledge',

    // User management permissions
    USERS_VIEW: 'users:view',
    USERS_CREATE: 'users:create',
    USERS_EDIT: 'users:edit',
    USERS_DELETE: 'users:delete',

    // Settings permissions
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_EDIT: 'settings:edit',

    // Data source permissions
    DATA_VIEW: 'data:view',
    DATA_INGEST: 'data:ingest',
    DATA_EXPORT: 'data:export'
};

// Role-Permission mapping
const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin has all permissions
    [ROLES.MANAGER]: [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.DASHBOARD_CREATE,
        PERMISSIONS.DASHBOARD_EDIT,
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.ANALYTICS_EXPORT,
        PERMISSIONS.COMMENTS_VIEW,
        PERMISSIONS.COMMENTS_CREATE,
        PERMISSIONS.COMMENTS_EDIT,
        PERMISSIONS.TASKS_VIEW,
        PERMISSIONS.TASKS_CREATE,
        PERMISSIONS.TASKS_EDIT,
        PERMISSIONS.TASKS_ASSIGN,
        PERMISSIONS.ALERTS_VIEW,
        PERMISSIONS.ALERTS_CREATE,
        PERMISSIONS.ALERTS_EDIT,
        PERMISSIONS.ALERTS_ACKNOWLEDGE,
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.DATA_VIEW,
        PERMISSIONS.DATA_EXPORT
    ],
    [ROLES.EMPLOYEE]: [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.DASHBOARD_EDIT, // Allow employees to create/edit widgets
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.COMMENTS_VIEW,
        PERMISSIONS.COMMENTS_CREATE,
        PERMISSIONS.TASKS_VIEW,
        PERMISSIONS.TASKS_EDIT,
        PERMISSIONS.ALERTS_VIEW,
        PERMISSIONS.ALERTS_ACKNOWLEDGE,
        PERMISSIONS.DATA_VIEW
    ]
};

// Check if user has specific permission
const hasPermission = (userRole, permission) => {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
};

// Check if user has any of the specified permissions
const hasAnyPermission = (userRole, permissions) => {
    return permissions.some(permission => hasPermission(userRole, permission));
};

// Check if user has all of the specified permissions
const hasAllPermissions = (userRole, permissions) => {
    return permissions.every(permission => hasPermission(userRole, permission));
};

// Middleware to check permissions
const requirePermission = (permission) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userRole = req.user.role?.name || ROLES.EMPLOYEE;

            if (!hasPermission(userRole, permission)) {
                logger.warn(`Access denied for user ${req.user.id} to permission ${permission}`);
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    requiredPermission: permission,
                    userRole: userRole
                });
            }

            next();
        } catch (error) {
            logger.error('Error checking permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    };
};

// Middleware to check multiple permissions (any)
const requireAnyPermission = (permissions) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userRole = req.user.role?.name || ROLES.EMPLOYEE;

            if (!hasAnyPermission(userRole, permissions)) {
                logger.warn(`Access denied for user ${req.user.id} to any of permissions: ${permissions.join(', ')}`);
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    requiredPermissions: permissions,
                    userRole: userRole
                });
            }

            next();
        } catch (error) {
            logger.error('Error checking permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    };
};

// Middleware to check multiple permissions (all)
const requireAllPermissions = (permissions) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userRole = req.user.role?.name || ROLES.EMPLOYEE;

            if (!hasAllPermissions(userRole, permissions)) {
                logger.warn(`Access denied for user ${req.user.id} to all permissions: ${permissions.join(', ')}`);
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    requiredPermissions: permissions,
                    userRole: userRole
                });
            }

            next();
        } catch (error) {
            logger.error('Error checking permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    };
};

// Middleware to check role
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userRole = req.user.role?.name || ROLES.EMPLOYEE;

            if (!allowedRoles.includes(userRole)) {
                logger.warn(`Access denied for user ${req.user.id} with role ${userRole}`);
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient role privileges',
                    requiredRoles: allowedRoles,
                    userRole: userRole
                });
            }

            next();
        } catch (error) {
            logger.error('Error checking role:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking role'
            });
        }
    };
};

// Helper function to get user permissions
const getUserPermissions = (userRole) => {
    return ROLE_PERMISSIONS[userRole] || [];
};

// Helper function to check if user can access resource
const canAccessResource = (userRole, resource, action) => {
    const permission = `${resource}:${action}`;
    return hasPermission(userRole, permission);
};

module.exports = {
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
    requireRole,
    getUserPermissions,
    canAccessResource
};
