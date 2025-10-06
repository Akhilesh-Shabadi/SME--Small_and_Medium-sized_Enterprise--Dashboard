const { Dashboard, Widget, DataSource, User } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Get all dashboards for user
// @route   GET /api/dashboard
// @access  Private
const getDashboards = async (req, res) => {
    try {
        const userId = req.user.id;

        const dashboards = await Dashboard.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { createdBy: userId },
                    { isPublic: true }
                ]
            },
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }, {
                model: Widget,
                as: 'widgets',
                include: [{
                    model: DataSource,
                    as: 'dataSource',
                    attributes: ['id', 'name', 'type', 'isActive']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: { dashboards }
        });
    } catch (error) {
        logger.error('Error fetching dashboards:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboards'
        });
    }
};

// @desc    Get single dashboard
// @route   GET /api/dashboard/:id
// @access  Private
const getDashboard = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const dashboard = await Dashboard.findOne({
            where: {
                id,
                [require('sequelize').Op.or]: [
                    { createdBy: userId },
                    { isPublic: true }
                ]
            },
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }, {
                model: Widget,
                as: 'widgets',
                include: [{
                    model: DataSource,
                    as: 'dataSource',
                    attributes: ['id', 'name', 'type', 'isActive']
                }],
                order: [['createdAt', 'ASC']]
            }]
        });

        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: 'Dashboard not found'
            });
        }

        res.json({
            success: true,
            data: { dashboard }
        });
    } catch (error) {
        logger.error('Error fetching dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard'
        });
    }
};

// @desc    Create new dashboard
// @route   POST /api/dashboard
// @access  Private
const createDashboard = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, description, isPublic, layout, settings } = req.body;
        const userId = req.user.id;

        const dashboard = await Dashboard.create({
            name,
            description,
            isPublic: isPublic || false,
            layout: layout || {},
            settings: settings || {},
            createdBy: userId
        });

        // Get dashboard with creator info
        const dashboardWithCreator = await Dashboard.findByPk(dashboard.id, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Dashboard created successfully',
            data: { dashboard: dashboardWithCreator }
        });
    } catch (error) {
        logger.error('Error creating dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create dashboard'
        });
    }
};

// @desc    Update dashboard
// @route   PUT /api/dashboard/:id
// @access  Private
const updateDashboard = async (req, res) => {
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
        const userId = req.user.id;
        const { name, description, isPublic, layout, settings } = req.body;

        const dashboard = await Dashboard.findOne({
            where: { id, createdBy: userId }
        });

        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: 'Dashboard not found or access denied'
            });
        }

        await dashboard.update({
            name: name || dashboard.name,
            description: description !== undefined ? description : dashboard.description,
            isPublic: isPublic !== undefined ? isPublic : dashboard.isPublic,
            layout: layout || dashboard.layout,
            settings: settings || dashboard.settings
        });

        res.json({
            success: true,
            message: 'Dashboard updated successfully',
            data: { dashboard }
        });
    } catch (error) {
        logger.error('Error updating dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update dashboard'
        });
    }
};

// @desc    Delete dashboard
// @route   DELETE /api/dashboard/:id
// @access  Private
const deleteDashboard = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const dashboard = await Dashboard.findOne({
            where: { id, createdBy: userId }
        });

        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: 'Dashboard not found or access denied'
            });
        }

        await dashboard.destroy();

        res.json({
            success: true,
            message: 'Dashboard deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete dashboard'
        });
    }
};

// @desc    Duplicate dashboard
// @route   POST /api/dashboard/:id/duplicate
// @access  Private
const duplicateDashboard = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const originalDashboard = await Dashboard.findOne({
            where: {
                id,
                [require('sequelize').Op.or]: [
                    { createdBy: userId },
                    { isPublic: true }
                ]
            },
            include: [{
                model: Widget,
                as: 'widgets'
            }]
        });

        if (!originalDashboard) {
            return res.status(404).json({
                success: false,
                message: 'Dashboard not found'
            });
        }

        // Create new dashboard
        const newDashboard = await Dashboard.create({
            name: `${originalDashboard.name} (Copy)`,
            description: originalDashboard.description,
            isPublic: false,
            layout: originalDashboard.layout,
            settings: originalDashboard.settings,
            createdBy: userId
        });

        // Duplicate widgets
        for (const widget of originalDashboard.widgets) {
            await Widget.create({
                dashboardId: newDashboard.id,
                dataSourceId: widget.dataSourceId,
                type: widget.type,
                title: widget.title,
                description: widget.description,
                position: widget.position,
                size: widget.size,
                config: widget.config,
                filters: widget.filters,
                refreshInterval: widget.refreshInterval,
                isVisible: widget.isVisible
            });
        }

        // Get the new dashboard with widgets
        const dashboardWithWidgets = await Dashboard.findByPk(newDashboard.id, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }, {
                model: Widget,
                as: 'widgets',
                include: [{
                    model: DataSource,
                    as: 'dataSource',
                    attributes: ['id', 'name', 'type', 'isActive']
                }]
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Dashboard duplicated successfully',
            data: { dashboard: dashboardWithWidgets }
        });
    } catch (error) {
        logger.error('Error duplicating dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to duplicate dashboard'
        });
    }
};

module.exports = {
    getDashboards,
    getDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    duplicateDashboard
};
