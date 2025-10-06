const { Task, User, Widget } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Get tasks for a dashboard
// @route   GET /api/collaboration/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const { dashboardId, assignedTo, status, priority } = req.query;
        const userId = req.user.id;

        let whereClause = {};

        // Filter by dashboard if provided
        if (dashboardId) {
            whereClause.dashboardId = dashboardId;
        }

        // Filter by assigned user
        if (assignedTo) {
            whereClause.assignedTo = assignedTo;
        }

        // Filter by status
        if (status) {
            whereClause.status = status;
        }

        // Filter by priority
        if (priority) {
            whereClause.priority = priority;
        }

        const tasks = await Task.findAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: User,
                as: 'assignee',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: Widget,
                as: 'widget',
                attributes: ['id', 'title', 'type']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: { tasks }
        });
    } catch (error) {
        logger.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks'
        });
    }
};

// @desc    Get single task
// @route   GET /api/collaboration/tasks/:id
// @access  Private
const getTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findByPk(id, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: User,
                as: 'assignee',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: Widget,
                as: 'widget',
                attributes: ['id', 'title', 'type']
            }]
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: { task }
        });
    } catch (error) {
        logger.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task'
        });
    }
};

// @desc    Create a new task
// @route   POST /api/collaboration/tasks
// @access  Private
const createTask = async (req, res) => {
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
            title,
            description,
            widgetId,
            assignedTo,
            priority,
            dueDate,
            tags,
            metadata
        } = req.body;
        const createdBy = req.user.id;

        const task = await Task.create({
            title,
            description,
            widgetId,
            createdBy,
            assignedTo,
            priority: priority || 'medium',
            dueDate: dueDate ? new Date(dueDate) : null,
            tags: tags || [],
            metadata: metadata || {}
        });

        // Get task with user details
        const taskWithUsers = await Task.findByPk(task.id, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: User,
                as: 'assignee',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: Widget,
                as: 'widget',
                attributes: ['id', 'title', 'type']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: { task: taskWithUsers }
        });
    } catch (error) {
        logger.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task'
        });
    }
};

// @desc    Update a task
// @route   PUT /api/collaboration/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
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
        const {
            title,
            description,
            status,
            priority,
            dueDate,
            tags,
            metadata
        } = req.body;
        const userId = req.user.id;

        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check if user can update task (creator or assignee)
        if (task.createdBy !== userId && task.assignedTo !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) {
            updateData.status = status;
            if (status === 'completed') {
                updateData.completedAt = new Date();
            }
        }
        if (priority !== undefined) updateData.priority = priority;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
        if (tags !== undefined) updateData.tags = tags;
        if (metadata !== undefined) updateData.metadata = metadata;

        await task.update(updateData);

        // Get updated task with user details
        const updatedTask = await Task.findByPk(id, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: User,
                as: 'assignee',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: Widget,
                as: 'widget',
                attributes: ['id', 'title', 'type']
            }]
        });

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: { task: updatedTask }
        });
    } catch (error) {
        logger.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task'
        });
    }
};

// @desc    Delete a task
// @route   DELETE /api/collaboration/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Only creator can delete task
        if (task.createdBy !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await task.destroy();

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task'
        });
    }
};

// @desc    Get user's tasks
// @route   GET /api/collaboration/tasks/my-tasks
// @access  Private
const getMyTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, priority } = req.query;

        let whereClause = {
            [require('sequelize').Op.or]: [
                { createdBy: userId },
                { assignedTo: userId }
            ]
        };

        if (status) {
            whereClause.status = status;
        }

        if (priority) {
            whereClause.priority = priority;
        }

        const tasks = await Task.findAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: User,
                as: 'assignee',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }, {
                model: Widget,
                as: 'widget',
                attributes: ['id', 'title', 'type']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: { tasks }
        });
    } catch (error) {
        logger.error('Error fetching user tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user tasks'
        });
    }
};

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getMyTasks
};
