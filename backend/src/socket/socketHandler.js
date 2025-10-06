const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');

// Store active users and their socket connections
const activeUsers = new Map();
const userRooms = new Map();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId, {
            attributes: ['id', 'firstName', 'lastName', 'email', 'isActive']
        });

        if (!user || !user.isActive) {
            return next(new Error('Authentication error: Invalid or inactive user'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
    } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
    }
};

// Socket handler
const socketHandler = (io) => {
    // Apply authentication middleware
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        const userId = socket.userId;
        const user = socket.user;

        logger.info(`User ${user.email} connected with socket ${socket.id}`);

        // Store user connection
        activeUsers.set(userId, {
            socketId: socket.id,
            user: user,
            connectedAt: new Date()
        });

        // Join user to their personal room
        socket.join(`user:${userId}`);

        // Join user to general dashboard room
        socket.join('dashboard');

        // Notify other users about new connection
        socket.to('dashboard').emit('user:connected', {
            userId,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            },
            timestamp: new Date()
        });

        // Handle joining specific dashboard
        socket.on('dashboard:join', (dashboardId) => {
            socket.join(`dashboard:${dashboardId}`);
            userRooms.set(socket.id, `dashboard:${dashboardId}`);

            logger.info(`User ${user.email} joined dashboard ${dashboardId}`);

            // Notify others in the dashboard
            socket.to(`dashboard:${dashboardId}`).emit('dashboard:user_joined', {
                userId,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                },
                timestamp: new Date()
            });
        });

        // Handle leaving dashboard
        socket.on('dashboard:leave', (dashboardId) => {
            socket.leave(`dashboard:${dashboardId}`);
            userRooms.delete(socket.id);

            logger.info(`User ${user.email} left dashboard ${dashboardId}`);

            // Notify others in the dashboard
            socket.to(`dashboard:${dashboardId}`).emit('dashboard:user_left', {
                userId,
                timestamp: new Date()
            });
        });

        // Handle real-time data updates
        socket.on('data:subscribe', (dataSourceId) => {
            socket.join(`data:${dataSourceId}`);
            logger.info(`User ${user.email} subscribed to data source ${dataSourceId}`);
        });

        socket.on('data:unsubscribe', (dataSourceId) => {
            socket.leave(`data:${dataSourceId}`);
            logger.info(`User ${user.email} unsubscribed from data source ${dataSourceId}`);
        });

        // Handle collaborative features
        socket.on('comment:create', async (data) => {
            try {
                const { widgetId, content, parentId } = data;

                // Broadcast to all users viewing the same widget
                socket.to(`widget:${widgetId}`).emit('comment:new', {
                    id: data.id,
                    userId,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName
                    },
                    widgetId,
                    content,
                    parentId,
                    timestamp: new Date()
                });
            } catch (error) {
                logger.error('Error handling comment creation:', error);
                socket.emit('error', { message: 'Failed to create comment' });
            }
        });

        socket.on('comment:update', (data) => {
            const { widgetId, commentId } = data;
            socket.to(`widget:${widgetId}`).emit('comment:updated', {
                commentId,
                userId,
                ...data,
                timestamp: new Date()
            });
        });

        socket.on('comment:delete', (data) => {
            const { widgetId, commentId } = data;
            socket.to(`widget:${widgetId}`).emit('comment:deleted', {
                commentId,
                userId,
                timestamp: new Date()
            });
        });

        // Handle task assignments
        socket.on('task:create', (data) => {
            const { widgetId, assignedTo } = data;

            // Notify the assigned user
            socket.to(`user:${assignedTo}`).emit('task:assigned', {
                ...data,
                createdBy: userId,
                createdByUser: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName
                },
                timestamp: new Date()
            });

            // Notify all users in the dashboard
            socket.to(`dashboard:${data.dashboardId}`).emit('task:created', {
                ...data,
                createdBy: userId,
                createdByUser: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName
                },
                timestamp: new Date()
            });
        });

        socket.on('task:update', (data) => {
            const { dashboardId, taskId } = data;
            socket.to(`dashboard:${dashboardId}`).emit('task:updated', {
                taskId,
                userId,
                ...data,
                timestamp: new Date()
            });
        });

        // Handle widget interactions
        socket.on('widget:interact', (data) => {
            const { widgetId, interactionType, data: interactionData } = data;

            socket.to(`widget:${widgetId}`).emit('widget:interaction', {
                widgetId,
                userId,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName
                },
                interactionType,
                data: interactionData,
                timestamp: new Date()
            });
        });

        // Handle alerts
        socket.on('alert:acknowledge', (data) => {
            const { alertId, dashboardId } = data;

            socket.to(`dashboard:${dashboardId}`).emit('alert:acknowledged', {
                alertId,
                acknowledgedBy: userId,
                acknowledgedByUser: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName
                },
                timestamp: new Date()
            });
        });

        // Handle typing indicators
        socket.on('typing:start', (data) => {
            const { widgetId } = data;
            socket.to(`widget:${widgetId}`).emit('typing:started', {
                userId,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName
                },
                widgetId,
                timestamp: new Date()
            });
        });

        socket.on('typing:stop', (data) => {
            const { widgetId } = data;
            socket.to(`widget:${widgetId}`).emit('typing:stopped', {
                userId,
                widgetId,
                timestamp: new Date()
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            logger.info(`User ${user.email} disconnected`);

            // Remove from active users
            activeUsers.delete(userId);

            // Notify others about disconnection
            socket.to('dashboard').emit('user:disconnected', {
                userId,
                timestamp: new Date()
            });

            // Clean up user rooms
            const userRoom = userRooms.get(socket.id);
            if (userRoom) {
                socket.to(userRoom).emit('dashboard:user_left', {
                    userId,
                    timestamp: new Date()
                });
                userRooms.delete(socket.id);
            }
        });

        // Handle errors
        socket.on('error', (error) => {
            logger.error(`Socket error for user ${user.email}:`, error);
        });
    });

    // Broadcast real-time data updates
    const broadcastDataUpdate = (dataSourceId, data) => {
        io.to(`data:${dataSourceId}`).emit('data:update', {
            dataSourceId,
            data,
            timestamp: new Date()
        });
    };

    // Broadcast alert
    const broadcastAlert = (alert) => {
        // Send to specific user if alert is user-specific
        if (alert.userId) {
            io.to(`user:${alert.userId}`).emit('alert:new', alert);
        } else {
            // Broadcast to all users
            io.to('dashboard').emit('alert:new', alert);
        }
    };

    // Broadcast notification
    const broadcastNotification = (userId, notification) => {
        io.to(`user:${userId}`).emit('notification:new', notification);
    };

    // Get active users
    const getActiveUsers = () => {
        return Array.from(activeUsers.values());
    };

    // Get users in dashboard
    const getDashboardUsers = (dashboardId) => {
        const room = io.sockets.adapter.rooms.get(`dashboard:${dashboardId}`);
        if (!room) return [];

        return Array.from(room).map(socketId => {
            const socket = io.sockets.sockets.get(socketId);
            return socket ? {
                socketId,
                userId: socket.userId,
                user: socket.user
            } : null;
        }).filter(Boolean);
    };

    return {
        broadcastDataUpdate,
        broadcastAlert,
        broadcastNotification,
        getActiveUsers,
        getDashboardUsers
    };
};

module.exports = socketHandler;
