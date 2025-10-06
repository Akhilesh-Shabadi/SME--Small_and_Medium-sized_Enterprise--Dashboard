const cron = require('node-cron');
const { DataSource, SalesData, InventoryData, CustomerFeedback, Alert } = require('../models');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');

class DataIngestionService {
    constructor() {
        this.isRunning = false;
        this.jobs = new Map();
    }

    // Start data ingestion service
    start() {
        if (this.isRunning) {
            logger.warn('Data ingestion service is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting data ingestion service');

        // Start cron job to sync all active data sources
        this.scheduleDataSync();

        // Start individual data source sync jobs
        this.startDataSourceJobs();
    }

    // Stop data ingestion service
    stop() {
        if (!this.isRunning) {
            logger.warn('Data ingestion service is not running');
            return;
        }

        this.isRunning = false;

        // Stop all cron jobs
        this.jobs.forEach((job, dataSourceId) => {
            job.destroy();
            this.jobs.delete(dataSourceId);
        });

        logger.info('Data ingestion service stopped');
    }

    // Schedule data sync every minute
    scheduleDataSync() {
        cron.schedule('* * * * *', async () => {
            try {
                await this.syncAllDataSources();
            } catch (error) {
                logger.error('Error in scheduled data sync:', error);
            }
        });
    }

    // Start individual data source sync jobs
    async startDataSourceJobs() {
        try {
            const dataSources = await DataSource.findAll({
                where: { isActive: true }
            });

            for (const dataSource of dataSources) {
                await this.startDataSourceJob(dataSource);
            }
        } catch (error) {
            logger.error('Error starting data source jobs:', error);
        }
    }

    // Start job for specific data source
    async startDataSourceJob(dataSource) {
        try {
            const { id, refreshInterval } = dataSource;
            const intervalMs = refreshInterval || 60000; // Default 1 minute
            const intervalMinutes = Math.max(1, Math.floor(intervalMs / 60000));

            const job = cron.schedule(`*/${intervalMinutes} * * * * *`, async () => {
                await this.syncDataSource(dataSource);
            });

            this.jobs.set(id, job);
            logger.info(`Started sync job for data source ${dataSource.name} (${id})`);
        } catch (error) {
            logger.error(`Error starting job for data source ${dataSource.name}:`, error);
        }
    }

    // Sync all active data sources
    async syncAllDataSources() {
        try {
            const dataSources = await DataSource.findAll({
                where: { isActive: true }
            });

            const syncPromises = dataSources.map(dataSource =>
                this.syncDataSource(dataSource)
            );

            await Promise.allSettled(syncPromises);
        } catch (error) {
            logger.error('Error syncing all data sources:', error);
        }
    }

    // Sync specific data source
    async syncDataSource(dataSource) {
        const startTime = Date.now();

        try {
            logger.info(`Syncing data source: ${dataSource.name}`);

            // Update sync status
            await dataSource.update({
                syncStatus: 'pending',
                lastSync: new Date()
            });

            let data = [];

            // Fetch data based on data source type
            switch (dataSource.type) {
                case 'pos':
                    data = await this.fetchPOSData(dataSource);
                    break;
                case 'ecommerce':
                    data = await this.fetchEcommerceData(dataSource);
                    break;
                case 'inventory':
                    data = await this.fetchInventoryData(dataSource);
                    break;
                case 'feedback':
                    data = await this.fetchFeedbackData(dataSource);
                    break;
                case 'api':
                    data = await this.fetchAPIData(dataSource);
                    break;
                case 'file':
                    data = await this.fetchFileData(dataSource);
                    break;
                default:
                    throw new Error(`Unknown data source type: ${dataSource.type}`);
            }

            // Process and store data
            await this.processData(dataSource, data);

            // Update sync status
            await dataSource.update({
                syncStatus: 'success',
                lastSync: new Date(),
                errorMessage: null
            });

            const duration = Date.now() - startTime;
            logger.info(`Successfully synced data source ${dataSource.name} in ${duration}ms`);

            // Publish to Redis for real-time updates
            await this.publishDataUpdate(dataSource.id, data);

        } catch (error) {
            logger.error(`Error syncing data source ${dataSource.name}:`, error);

            // Update sync status
            await dataSource.update({
                syncStatus: 'error',
                errorMessage: error.message
            });
        }
    }

    // Fetch POS data (simulated)
    async fetchPOSData(dataSource) {
        // Simulate POS API call
        const mockData = this.generateMockSalesData();
        return mockData;
    }

    // Fetch e-commerce data (simulated)
    async fetchEcommerceData(dataSource) {
        // Simulate e-commerce API call
        const mockData = this.generateMockSalesData();
        return mockData;
    }

    // Fetch inventory data (simulated)
    async fetchInventoryData(dataSource) {
        // Simulate inventory API call
        const mockData = this.generateMockInventoryData();
        return mockData;
    }

    // Fetch feedback data (simulated)
    async fetchFeedbackData(dataSource) {
        // Simulate feedback API call
        const mockData = this.generateMockFeedbackData();
        return mockData;
    }

    // Fetch API data
    async fetchAPIData(dataSource) {
        const { connectionConfig } = dataSource;
        const { url, method = 'GET', headers = {}, body } = connectionConfig;

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    // Fetch file data
    async fetchFileData(dataSource) {
        const { connectionConfig } = dataSource;
        const { filePath, fileType = 'json' } = connectionConfig;

        // Implementation would depend on file type and location
        // For now, return empty array
        return [];
    }

    // Process and store data
    async processData(dataSource, data) {
        try {
            switch (dataSource.type) {
                case 'pos':
                case 'ecommerce':
                    await this.processSalesData(dataSource, data);
                    break;
                case 'inventory':
                    await this.processInventoryData(dataSource, data);
                    break;
                case 'feedback':
                    await this.processFeedbackData(dataSource, data);
                    break;
                default:
                    logger.warn(`No processor for data source type: ${dataSource.type}`);
            }
        } catch (error) {
            logger.error(`Error processing data for ${dataSource.name}:`, error);
            throw error;
        }
    }

    // Process sales data
    async processSalesData(dataSource, data) {
        const salesRecords = data.map(record => ({
            dataSourceId: dataSource.id,
            ...record,
            timestamp: new Date(record.timestamp || Date.now())
        }));

        await SalesData.bulkCreate(salesRecords, {
            ignoreDuplicates: true
        });
    }

    // Process inventory data
    async processInventoryData(dataSource, data) {
        const inventoryRecords = data.map(record => ({
            dataSourceId: dataSource.id,
            ...record,
            timestamp: new Date(record.timestamp || Date.now())
        }));

        await InventoryData.bulkCreate(inventoryRecords, {
            ignoreDuplicates: true
        });
    }

    // Process feedback data
    async processFeedbackData(dataSource, data) {
        const feedbackRecords = data.map(record => ({
            dataSourceId: dataSource.id,
            ...record,
            timestamp: new Date(record.timestamp || Date.now())
        }));

        await CustomerFeedback.bulkCreate(feedbackRecords, {
            ignoreDuplicates: true
        });
    }

    // Publish data update to Redis
    async publishDataUpdate(dataSourceId, data) {
        try {
            if (redisClient.isOpen) {
                await redisClient.publish('data:update', JSON.stringify({
                    dataSourceId,
                    data,
                    timestamp: new Date()
                }));
            }
        } catch (error) {
            logger.error('Error publishing data update to Redis:', error);
        }
    }

    // Generate mock sales data
    generateMockSalesData() {
        const products = ['Laptop', 'Phone', 'Tablet', 'Headphones', 'Mouse', 'Keyboard'];
        const categories = ['Electronics', 'Accessories', 'Computers'];
        const paymentMethods = ['cash', 'card', 'online'];
        const channels = ['pos', 'online', 'mobile'];

        const data = [];
        const recordCount = Math.floor(Math.random() * 10) + 1; // 1-10 records

        for (let i = 0; i < recordCount; i++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const quantity = Math.floor(Math.random() * 5) + 1;
            const unitPrice = Math.floor(Math.random() * 500) + 50;
            const totalAmount = quantity * unitPrice;

            data.push({
                transactionId: `TXN-${Date.now()}-${i}`,
                productId: `PROD-${Math.floor(Math.random() * 1000)}`,
                productName: product,
                category,
                quantity,
                unitPrice,
                totalAmount,
                discount: Math.floor(Math.random() * 20),
                tax: Math.floor(totalAmount * 0.1),
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                customerId: `CUST-${Math.floor(Math.random() * 1000)}`,
                channel: channels[Math.floor(Math.random() * channels.length)],
                location: 'Store 1',
                timestamp: new Date(Date.now() - Math.random() * 3600000) // Last hour
            });
        }

        return data;
    }

    // Generate mock inventory data
    generateMockInventoryData() {
        const products = ['Laptop', 'Phone', 'Tablet', 'Headphones', 'Mouse', 'Keyboard'];
        const categories = ['Electronics', 'Accessories', 'Computers'];
        const suppliers = ['Supplier A', 'Supplier B', 'Supplier C'];

        const data = [];

        for (const product of products) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const currentStock = Math.floor(Math.random() * 100);
            const minStock = Math.floor(Math.random() * 20) + 5;
            const maxStock = minStock + Math.floor(Math.random() * 50) + 20;
            const unitCost = Math.floor(Math.random() * 200) + 50;

            data.push({
                productId: `PROD-${Math.floor(Math.random() * 1000)}`,
                productName: product,
                sku: `SKU-${product.toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
                category,
                currentStock,
                minStock,
                maxStock,
                unitCost,
                totalValue: currentStock * unitCost,
                location: 'Warehouse A',
                supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
                lastRestocked: new Date(Date.now() - Math.random() * 7 * 24 * 3600000), // Last week
                lastSold: new Date(Date.now() - Math.random() * 24 * 3600000), // Last day
                status: currentStock <= minStock ? 'low_stock' :
                    currentStock === 0 ? 'out_of_stock' : 'in_stock',
                timestamp: new Date()
            });
        }

        return data;
    }

    // Generate mock feedback data
    generateMockFeedbackData() {
        const customers = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];
        const products = ['Laptop', 'Phone', 'Tablet', 'Headphones', 'Mouse'];
        const categories = ['product', 'service', 'delivery', 'support'];
        const channels = ['website', 'email', 'phone', 'social'];

        const data = [];
        const recordCount = Math.floor(Math.random() * 5) + 1; // 1-5 records

        for (let i = 0; i < recordCount; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const product = products[Math.floor(Math.random() * products.length)];
            const rating = Math.floor(Math.random() * 5) + 1;
            const category = categories[Math.floor(Math.random() * categories.length)];
            const channel = channels[Math.floor(Math.random() * channels.length)];

            data.push({
                customerId: `CUST-${Math.floor(Math.random() * 1000)}`,
                customerName: customer,
                customerEmail: `${customer.toLowerCase().replace(' ', '.')}@email.com`,
                rating,
                title: `Review for ${product}`,
                comment: `This is a ${rating}-star review for ${product}`,
                category,
                productId: `PROD-${Math.floor(Math.random() * 1000)}`,
                orderId: `ORDER-${Math.floor(Math.random() * 1000)}`,
                channel,
                sentiment: rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative',
                isVerified: Math.random() > 0.3,
                isPublic: true,
                timestamp: new Date(Date.now() - Math.random() * 24 * 3600000) // Last day
            });
        }

        return data;
    }
}

module.exports = new DataIngestionService();
