const { Widget, Dashboard, DataSource, User } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Get all widgets for a dashboard
// @route   GET /api/dashboard/:dashboardId/widgets
// @access  Private
const getWidgets = async (req, res) => {
    try {
        const { dashboardId } = req.params;
        const userId = req.user.id;

        // Check if user has access to the dashboard
        const dashboard = await Dashboard.findOne({
            where: {
                id: dashboardId,
                [require('sequelize').Op.or]: [
                    { createdBy: userId },
                    { isPublic: true }
                ]
            }
        });

        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: 'Dashboard not found or access denied'
            });
        }

        const widgets = await Widget.findAll({
            where: { dashboardId },
            include: [{
                model: DataSource,
                as: 'dataSource',
                attributes: ['id', 'name', 'type', 'isActive']
            }],
            order: [['createdAt', 'ASC']]
        });

        res.json({
            success: true,
            data: { widgets }
        });
    } catch (error) {
        logger.error('Error fetching widgets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch widgets'
        });
    }
};

// @desc    Get single widget
// @route   GET /api/widget/:id
// @access  Private
const getWidget = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const widget = await Widget.findOne({
            where: { id },
            include: [{
                model: Dashboard,
                as: 'dashboard',
                where: {
                    [require('sequelize').Op.or]: [
                        { createdBy: userId },
                        { isPublic: true }
                    ]
                }
            }, {
                model: DataSource,
                as: 'dataSource',
                attributes: ['id', 'name', 'type', 'isActive']
            }]
        });

        if (!widget) {
            return res.status(404).json({
                success: false,
                message: 'Widget not found or access denied'
            });
        }

        res.json({
            success: true,
            data: { widget }
        });
    } catch (error) {
        logger.error('Error fetching widget:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch widget'
        });
    }
};

// @desc    Create new widget
// @route   POST /api/dashboard/:dashboardId/widgets
// @access  Private
const createWidget = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { dashboardId } = req.params;
        const userId = req.user.id;
        const { dataSourceId, type, title, description, position, size, config, filters, refreshInterval } = req.body;

        // Check if user has access to the dashboard
        const dashboard = await Dashboard.findOne({
            where: { id: dashboardId, createdBy: userId }
        });

        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: 'Dashboard not found or access denied'
            });
        }

        // Verify data source exists and is active
        const dataSource = await DataSource.findOne({
            where: { id: dataSourceId, isActive: true }
        });

        if (!dataSource) {
            return res.status(400).json({
                success: false,
                message: 'Data source not found or inactive'
            });
        }

        // Calculate position if not provided
        const widgets = await Widget.findAll({
            where: { dashboardId },
            order: [['createdAt', 'ASC']]
        });

        const defaultPosition = position || {
            x: (widgets.length % 3) * 4,
            y: Math.floor(widgets.length / 3) * 4
        };

        const defaultSize = size || {
            w: 4,
            h: 4
        };

        const widget = await Widget.create({
            dashboardId,
            dataSourceId,
            type,
            title,
            description,
            position: defaultPosition,
            size: defaultSize,
            config: config || {},
            filters: filters || {},
            refreshInterval: refreshInterval || 30000,
            isVisible: true
        });

        // Get widget with data source info
        const widgetWithDataSource = await Widget.findByPk(widget.id, {
            include: [{
                model: DataSource,
                as: 'dataSource',
                attributes: ['id', 'name', 'type', 'isActive']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Widget created successfully',
            data: { widget: widgetWithDataSource }
        });
    } catch (error) {
        logger.error('Error creating widget:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create widget'
        });
    }
};

// @desc    Update widget
// @route   PUT /api/widget/:id
// @access  Private
const updateWidget = async (req, res) => {
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
        const { dataSourceId, type, title, description, position, size, config, filters, refreshInterval, isVisible } = req.body;

        // Check if user has access to the widget's dashboard
        const widget = await Widget.findOne({
            where: { id },
            include: [{
                model: Dashboard,
                as: 'dashboard',
                where: { createdBy: userId }
            }]
        });

        if (!widget) {
            return res.status(404).json({
                success: false,
                message: 'Widget not found or access denied'
            });
        }

        // Verify data source if provided
        if (dataSourceId && dataSourceId !== widget.dataSourceId) {
            const dataSource = await DataSource.findOne({
                where: { id: dataSourceId, isActive: true }
            });

            if (!dataSource) {
                return res.status(400).json({
                    success: false,
                    message: 'Data source not found or inactive'
                });
            }
        }

        await widget.update({
            dataSourceId: dataSourceId || widget.dataSourceId,
            type: type || widget.type,
            title: title || widget.title,
            description: description !== undefined ? description : widget.description,
            position: position || widget.position,
            size: size || widget.size,
            config: config || widget.config,
            filters: filters || widget.filters,
            refreshInterval: refreshInterval || widget.refreshInterval,
            isVisible: isVisible !== undefined ? isVisible : widget.isVisible
        });

        // Get updated widget with data source info
        const updatedWidget = await Widget.findByPk(widget.id, {
            include: [{
                model: DataSource,
                as: 'dataSource',
                attributes: ['id', 'name', 'type', 'isActive']
            }]
        });

        res.json({
            success: true,
            message: 'Widget updated successfully',
            data: { widget: updatedWidget }
        });
    } catch (error) {
        logger.error('Error updating widget:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update widget'
        });
    }
};

// @desc    Delete widget
// @route   DELETE /api/widget/:id
// @access  Private
const deleteWidget = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if user has access to the widget's dashboard
        const widget = await Widget.findOne({
            where: { id },
            include: [{
                model: Dashboard,
                as: 'dashboard',
                where: { createdBy: userId }
            }]
        });

        if (!widget) {
            return res.status(404).json({
                success: false,
                message: 'Widget not found or access denied'
            });
        }

        await widget.destroy();

        res.json({
            success: true,
            message: 'Widget deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting widget:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete widget'
        });
    }
};

// @desc    Get available data sources
// @route   GET /api/data-sources
// @access  Private
const getDataSources = async (req, res) => {
    try {
        const dataSources = await DataSource.findAll({
            where: { isActive: true },
            attributes: ['id', 'name', 'type', 'description'],
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: { dataSources }
        });
    } catch (error) {
        logger.error('Error fetching data sources:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch data sources'
        });
    }
};

module.exports = {
    getWidgets,
    getWidget,
    createWidget,
    updateWidget,
    deleteWidget,
    getDataSources
};
