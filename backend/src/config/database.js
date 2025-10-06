const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'sme_dashboard',
    process.env.DB_USER || 'test',
    process.env.DB_PASSWORD || '123',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 1433,
        dialect: 'mssql',
        dialectOptions: {
            options: {
                encrypt: true,
                trustServerCertificate: true
            }
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');

        // Sync database in development
        if (process.env.NODE_ENV === 'development') {
            // Use force: false to avoid dropping existing data
            // Use alter: false to prevent SQL Server syntax issues
            await sequelize.sync({ force: false, alter: false });
            logger.info('Database synchronized');

            // Run migration to add unique constraints
            try {
                const { migrateDatabase } = require('../scripts/migrateDatabase');
                await migrateDatabase();
            } catch (migrationError) {
                logger.warn('Migration failed, continuing without unique constraints:', migrationError.message);
            }
        }
    } catch (error) {
        logger.error('Unable to connect to the database:', error);

        // In development, don't exit the process immediately
        // Allow the app to start without database for testing
        if (process.env.NODE_ENV === 'development') {
            logger.warn('Running in development mode without database connection');
            logger.warn('Please check your database configuration in .env file');
        } else {
            process.exit(1);
        }
    }
};

module.exports = { connectDB, sequelize };