const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const migrateDatabase = async () => {
    try {
        logger.info('Starting database migration...');

        // Test connection first
        await sequelize.authenticate();
        logger.info('Database connection established');

        // Create tables if they don't exist (without altering existing ones)
        await sequelize.sync({ force: false, alter: false });
        logger.info('Database tables created/verified');

        // Add unique constraints manually for SQL Server compatibility
        const queries = [
            // Add unique constraint for users.email if it doesn't exist
            `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_users_email' AND object_id = OBJECT_ID('users'))
             BEGIN
                 ALTER TABLE users ADD CONSTRAINT UQ_users_email UNIQUE (email);
             END`,

            // Add unique constraint for roles.name if it doesn't exist
            `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_roles_name' AND object_id = OBJECT_ID('roles'))
             BEGIN
                 ALTER TABLE roles ADD CONSTRAINT UQ_roles_name UNIQUE (name);
             END`
        ];

        for (const query of queries) {
            try {
                await sequelize.query(query);
                logger.info('Unique constraint added successfully');
            } catch (error) {
                if (error.message.includes('already exists') || error.message.includes('duplicate')) {
                    logger.info('Unique constraint already exists, skipping...');
                } else {
                    logger.warn('Could not add unique constraint:', error.message);
                }
            }
        }

        logger.info('Database migration completed successfully');

    } catch (error) {
        logger.error('Database migration failed:', error);
        throw error;
    }
};

module.exports = { migrateDatabase };
