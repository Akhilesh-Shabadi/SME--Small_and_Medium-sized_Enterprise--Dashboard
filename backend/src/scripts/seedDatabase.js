const { sequelize } = require('../config/database');
const { User, Role, DataSource } = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const seedDatabase = async () => {
    try {
        logger.info('Starting database seeding...');

        // Test connection first
        await sequelize.authenticate();
        logger.info('Database connection established');

        // Create roles
        const roles = [
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'admin',
                description: 'Administrator with full access',
                permissions: [
                    'dashboard:view', 'dashboard:create', 'dashboard:edit', 'dashboard:delete',
                    'analytics:view', 'analytics:export',
                    'comments:view', 'comments:create', 'comments:edit', 'comments:delete',
                    'tasks:view', 'tasks:create', 'tasks:edit', 'tasks:delete', 'tasks:assign',
                    'alerts:view', 'alerts:create', 'alerts:edit', 'alerts:delete', 'alerts:acknowledge',
                    'users:view', 'users:create', 'users:edit', 'users:delete',
                    'settings:view', 'settings:edit',
                    'data:view', 'data:ingest', 'data:export'
                ],
                isActive: true
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440002',
                name: 'manager',
                description: 'Manager with limited administrative access',
                permissions: [
                    'dashboard:view', 'dashboard:create', 'dashboard:edit',
                    'analytics:view', 'analytics:export',
                    'comments:view', 'comments:create', 'comments:edit',
                    'tasks:view', 'tasks:create', 'tasks:edit', 'tasks:assign',
                    'alerts:view', 'alerts:create', 'alerts:edit', 'alerts:acknowledge',
                    'users:view',
                    'settings:view',
                    'data:view', 'data:export'
                ],
                isActive: true
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440003',
                name: 'employee',
                description: 'Employee with basic access',
                permissions: [
                    'dashboard:view',
                    'analytics:view',
                    'comments:view', 'comments:create',
                    'tasks:view', 'tasks:edit',
                    'alerts:view', 'alerts:acknowledge',
                    'data:view'
                ],
                isActive: true
            }
        ];

        // Create roles
        for (const roleData of roles) {
            const [role, created] = await Role.findOrCreate({
                where: { id: roleData.id },
                defaults: roleData
            });

            if (created) {
                logger.info(`Created role: ${role.name}`);
            } else {
                logger.info(`Role already exists: ${role.name}`);
            }
        }

        // Create default admin user
        const adminRole = await Role.findOne({ where: { name: 'admin' } });
        if (adminRole) {
            const hashedPassword = await bcrypt.hash('admin123', 12);

            const [adminUser, created] = await User.findOrCreate({
                where: { email: 'admin@example.com' },
                defaults: {
                    id: '550e8400-e29b-41d4-a716-446655440001',
                    firstName: 'Admin',
                    lastName: 'User',
                    email: 'admin@example.com',
                    password: hashedPassword,
                    roleId: adminRole.id,
                    isActive: true
                }
            });

            if (created) {
                logger.info('Created admin user: admin@example.com (password: admin123)');
            } else {
                logger.info('Admin user already exists');
            }
        }

        // Create a test employee user
        const employeeRole = await Role.findOne({ where: { name: 'employee' } });
        if (employeeRole) {
            const hashedPassword = await bcrypt.hash('employee123', 12);

            const [employeeUser, created] = await User.findOrCreate({
                where: { email: 'employee@example.com' },
                defaults: {
                    id: '550e8400-e29b-41d4-a716-446655440002',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'employee@example.com',
                    password: hashedPassword,
                    roleId: employeeRole.id,
                    isActive: true
                }
            });

            if (created) {
                logger.info('Created employee user: employee@example.com (password: employee123)');
            } else {
                logger.info('Employee user already exists');
            }
        }

        // Create sample data sources
        const sampleDataSources = [
            {
                id: '550e8400-e29b-41d4-a716-446655440010',
                name: 'POS System - Main Store',
                type: 'pos',
                description: 'Point of sale data from the main store location',
                connectionConfig: {
                    apiUrl: 'https://pos-api.example.com',
                    apiKey: 'sample-api-key',
                    storeId: 'main-store-001'
                },
                dataSchema: {
                    sales: {
                        fields: ['id', 'date', 'amount', 'customer_id', 'items'],
                        primaryKey: 'id'
                    },
                    customers: {
                        fields: ['id', 'name', 'email', 'phone'],
                        primaryKey: 'id'
                    }
                },
                refreshInterval: 300000, // 5 minutes
                isActive: true,
                syncStatus: 'success'
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440011',
                name: 'E-commerce Platform',
                type: 'ecommerce',
                description: 'Online store data from Shopify/WooCommerce',
                connectionConfig: {
                    platform: 'shopify',
                    shopDomain: 'mystore.myshopify.com',
                    accessToken: 'sample-access-token'
                },
                dataSchema: {
                    orders: {
                        fields: ['id', 'order_number', 'total_price', 'created_at', 'customer'],
                        primaryKey: 'id'
                    },
                    products: {
                        fields: ['id', 'title', 'price', 'inventory_quantity', 'vendor'],
                        primaryKey: 'id'
                    }
                },
                refreshInterval: 600000, // 10 minutes
                isActive: true,
                syncStatus: 'success'
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440012',
                name: 'Inventory Management',
                type: 'inventory',
                description: 'Stock levels and product information',
                connectionConfig: {
                    database: {
                        host: 'inventory-db.example.com',
                        port: 5432,
                        database: 'inventory',
                        username: 'inventory_user'
                    }
                },
                dataSchema: {
                    products: {
                        fields: ['sku', 'name', 'category', 'stock_quantity', 'reorder_level'],
                        primaryKey: 'sku'
                    },
                    categories: {
                        fields: ['id', 'name', 'parent_id'],
                        primaryKey: 'id'
                    }
                },
                refreshInterval: 180000, // 3 minutes
                isActive: true,
                syncStatus: 'success'
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440013',
                name: 'Customer Feedback',
                type: 'feedback',
                description: 'Customer reviews and ratings from various platforms',
                connectionConfig: {
                    platforms: ['google', 'yelp', 'trustpilot'],
                    apiKeys: {
                        google: 'google-api-key',
                        yelp: 'yelp-api-key',
                        trustpilot: 'trustpilot-api-key'
                    }
                },
                dataSchema: {
                    reviews: {
                        fields: ['id', 'rating', 'comment', 'date', 'platform', 'customer_name'],
                        primaryKey: 'id'
                    }
                },
                refreshInterval: 3600000, // 1 hour
                isActive: true,
                syncStatus: 'success'
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440014',
                name: 'Weather API',
                type: 'api',
                description: 'Weather data for business location',
                connectionConfig: {
                    apiUrl: 'https://api.openweathermap.org/data/2.5',
                    apiKey: 'weather-api-key',
                    location: {
                        lat: 40.7128,
                        lon: -74.0060
                    }
                },
                dataSchema: {
                    weather: {
                        fields: ['temperature', 'humidity', 'description', 'timestamp'],
                        primaryKey: 'timestamp'
                    }
                },
                refreshInterval: 1800000, // 30 minutes
                isActive: true,
                syncStatus: 'success'
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440015',
                name: 'Sales Report CSV',
                type: 'file',
                description: 'Monthly sales reports uploaded as CSV files',
                connectionConfig: {
                    filePath: '/uploads/sales-reports/',
                    fileFormat: 'csv',
                    delimiter: ',',
                    hasHeader: true
                },
                dataSchema: {
                    sales: {
                        fields: ['date', 'product', 'quantity', 'revenue', 'region'],
                        primaryKey: 'date'
                    }
                },
                refreshInterval: 86400000, // 24 hours
                isActive: true,
                syncStatus: 'success'
            }
        ];

        for (const dataSourceData of sampleDataSources) {
            const [dataSource, created] = await DataSource.findOrCreate({
                where: { id: dataSourceData.id },
                defaults: dataSourceData
            });

            if (created) {
                logger.info(`Created data source: ${dataSource.name}`);
            } else {
                logger.info(`Data source already exists: ${dataSource.name}`);
            }
        }

        logger.info('Database seeding completed successfully');

    } catch (error) {
        logger.error('Database seeding failed:', error);
        throw error;
    }
};

module.exports = { seedDatabase };
