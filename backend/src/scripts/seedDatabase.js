const { sequelize } = require('../config/database');
const { User, Role } = require('../models');
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

        logger.info('Database seeding completed successfully');

    } catch (error) {
        logger.error('Database seeding failed:', error);
        throw error;
    }
};

module.exports = { seedDatabase };
