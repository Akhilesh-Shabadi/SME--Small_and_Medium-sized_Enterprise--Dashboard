const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const logger = require('../utils/logger');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user with role information
        const user = await User.findByPk(decoded.userId, {
            include: [{
                model: Role,
                as: 'role'
            }]
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive user'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// Check if user has required permission
const authorize = (permission) => {
    return (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: 'User role not found'
                });
            }

            const userPermissions = req.user.role.permissions || [];

            if (!userPermissions.includes(permission)) {
                return res.status(403).json({
                    success: false,
                    message: `Insufficient permissions. Required: ${permission}`
                });
            }

            next();
        } catch (error) {
            logger.error('Authorization error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization failed'
            });
        }
    };
};

// Check if user has any of the required permissions
const authorizeAny = (permissions) => {
    return (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: 'User role not found'
                });
            }

            const userPermissions = req.user.role.permissions || [];
            const hasPermission = permissions.some(permission =>
                userPermissions.includes(permission)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Insufficient permissions. Required one of: ${permissions.join(', ')}`
                });
            }

            next();
        } catch (error) {
            logger.error('Authorization error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization failed'
            });
        }
    };
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'User role not found'
            });
        }

        if (req.user.role?.name !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        next();
    } catch (error) {
        logger.error('Admin authorization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization failed'
        });
    }
};

module.exports = {
    authenticateToken,
    authorize,
    authorizeAny,
    requireAdmin
};
