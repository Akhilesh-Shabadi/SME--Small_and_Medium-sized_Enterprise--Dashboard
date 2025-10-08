const { DataSource } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Get all data sources
// @route   GET /api/data-sources
// @access  Private
const getDataSources = async (req, res) => {
    try {
        const dataSources = await DataSource.findAll({
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

// @desc    Get single data source
// @route   GET /api/data-sources/:id
// @access  Private
const getDataSource = async (req, res) => {
    try {
        const { id } = req.params;

        const dataSource = await DataSource.findByPk(id);

        if (!dataSource) {
            return res.status(404).json({
                success: false,
                message: 'Data source not found'
            });
        }

        res.json({
            success: true,
            data: { dataSource }
        });
    } catch (error) {
        logger.error('Error fetching data source:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch data source'
        });
    }
};

// @desc    Create new data source
// @route   POST /api/data-sources
// @access  Private
const createDataSource = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, type, description, connectionConfig, dataSchema, refreshInterval } = req.body;

        const dataSource = await DataSource.create({
            name,
            type,
            description,
            connectionConfig: connectionConfig || {},
            dataSchema: dataSchema || {},
            refreshInterval: refreshInterval || 60000,
            isActive: true,
            syncStatus: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Data source created successfully',
            data: { dataSource }
        });
    } catch (error) {
        logger.error('Error creating data source:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create data source'
        });
    }
};

// @desc    Update data source
// @route   PUT /api/data-sources/:id
// @access  Private
const updateDataSource = async (req, res) => {
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
        const { name, type, description, connectionConfig, dataSchema, refreshInterval, isActive } = req.body;

        const dataSource = await DataSource.findByPk(id);

        if (!dataSource) {
            return res.status(404).json({
                success: false,
                message: 'Data source not found'
            });
        }

        await dataSource.update({
            name: name || dataSource.name,
            type: type || dataSource.type,
            description: description !== undefined ? description : dataSource.description,
            connectionConfig: connectionConfig || dataSource.connectionConfig,
            dataSchema: dataSchema || dataSource.dataSchema,
            refreshInterval: refreshInterval || dataSource.refreshInterval,
            isActive: isActive !== undefined ? isActive : dataSource.isActive
        });

        res.json({
            success: true,
            message: 'Data source updated successfully',
            data: { dataSource }
        });
    } catch (error) {
        logger.error('Error updating data source:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update data source'
        });
    }
};

// @desc    Delete data source
// @route   DELETE /api/data-sources/:id
// @access  Private
const deleteDataSource = async (req, res) => {
    try {
        const { id } = req.params;

        const dataSource = await DataSource.findByPk(id);

        if (!dataSource) {
            return res.status(404).json({
                success: false,
                message: 'Data source not found'
            });
        }

        await dataSource.destroy();

        res.json({
            success: true,
            message: 'Data source deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting data source:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete data source'
        });
    }
};

// @desc    Test data source connection
// @route   POST /api/data-sources/:id/test
// @access  Private
const testDataSource = async (req, res) => {
    try {
        const { id } = req.params;

        const dataSource = await DataSource.findByPk(id);

        if (!dataSource) {
            return res.status(404).json({
                success: false,
                message: 'Data source not found'
            });
        }

        // Update sync status to pending
        await dataSource.update({
            syncStatus: 'pending',
            lastSync: new Date()
        });

        // Here you would implement the actual connection test
        // For now, we'll simulate a test
        setTimeout(async () => {
            try {
                // Simulate successful connection
                await dataSource.update({
                    syncStatus: 'success',
                    lastSync: new Date(),
                    errorMessage: null
                });
            } catch (error) {
                await dataSource.update({
                    syncStatus: 'error',
                    lastSync: new Date(),
                    errorMessage: error.message
                });
            }
        }, 2000);

        res.json({
            success: true,
            message: 'Data source test initiated'
        });
    } catch (error) {
        logger.error('Error testing data source:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test data source'
        });
    }
};

// @desc    Sync data source
// @route   POST /api/data-sources/:id/sync
// @access  Private
const syncDataSource = async (req, res) => {
    try {
        const { id } = req.params;

        const dataSource = await DataSource.findByPk(id);

        if (!dataSource) {
            return res.status(404).json({
                success: false,
                message: 'Data source not found'
            });
        }

        // Import and use the data ingestion service
        const dataIngestionService = require('../services/dataIngestionService');
        await dataIngestionService.syncDataSource(dataSource);

        res.json({
            success: true,
            message: 'Data source sync initiated'
        });
    } catch (error) {
        logger.error('Error syncing data source:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync data source'
        });
    }
};

module.exports = {
    getDataSources,
    getDataSource,
    createDataSource,
    updateDataSource,
    deleteDataSource,
    testDataSource,
    syncDataSource
};
