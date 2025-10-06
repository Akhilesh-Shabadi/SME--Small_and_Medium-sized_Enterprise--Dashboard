#!/usr/bin/env node

/**
 * Database Migration Script for SME Dashboard
 * 
 * This script handles database schema migration for SQL Server compatibility.
 * Run this script when you encounter SQL syntax errors during database sync.
 * 
 * Usage:
 *   node migrate-db.js
 *   npm run migrate-db
 */

require('dotenv').config();
const { migrateDatabase } = require('./src/scripts/migrateDatabase');
const logger = require('./src/utils/logger');

const runMigration = async () => {
    try {
        logger.info('Starting manual database migration...');
        await migrateDatabase();
        logger.info('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('Migration failed:', error);
        process.exit(1);
    }
};

// Run migration if this script is executed directly
if (require.main === module) {
    runMigration();
}

module.exports = runMigration;
