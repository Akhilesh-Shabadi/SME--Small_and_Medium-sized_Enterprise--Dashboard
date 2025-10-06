const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Import all models
const User = require('./User')(sequelize, DataTypes);
const Role = require('./Role')(sequelize, DataTypes);
const Dashboard = require('./Dashboard')(sequelize, DataTypes);
const Widget = require('./Widget')(sequelize, DataTypes);
const DataSource = require('./DataSource')(sequelize, DataTypes);
const Alert = require('./Alert')(sequelize, DataTypes);
const Comment = require('./Comment')(sequelize, DataTypes);
const Task = require('./Task')(sequelize, DataTypes);
const Notification = require('./Notification')(sequelize, DataTypes);
const SalesData = require('./SalesData')(sequelize, DataTypes);
const InventoryData = require('./InventoryData')(sequelize, DataTypes);
const CustomerFeedback = require('./CustomerFeedback')(sequelize, DataTypes);

// Define associations
const defineAssociations = () => {
    // User associations
    User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
    User.hasMany(Dashboard, { foreignKey: 'createdBy', as: 'dashboards' });
    User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
    User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
    User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
    User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

    // Role associations
    Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

    // Dashboard associations
    Dashboard.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
    Dashboard.hasMany(Widget, { foreignKey: 'dashboardId', as: 'widgets' });
    Dashboard.belongsToMany(User, {
        through: 'DashboardUsers',
        as: 'sharedUsers',
        foreignKey: 'dashboardId',
        otherKey: 'userId'
    });

    // Widget associations
    Widget.belongsTo(Dashboard, { foreignKey: 'dashboardId', as: 'dashboard' });
    Widget.belongsTo(DataSource, { foreignKey: 'dataSourceId', as: 'dataSource' });
    Widget.hasMany(Comment, { foreignKey: 'widgetId', as: 'comments' });

    // DataSource associations
    DataSource.hasMany(Widget, { foreignKey: 'dataSourceId', as: 'widgets' });
    DataSource.hasMany(SalesData, { foreignKey: 'dataSourceId', as: 'salesData' });
    DataSource.hasMany(InventoryData, { foreignKey: 'dataSourceId', as: 'inventoryData' });
    DataSource.hasMany(CustomerFeedback, { foreignKey: 'dataSourceId', as: 'customerFeedback' });

    // Comment associations
    Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Comment.belongsTo(Widget, { foreignKey: 'widgetId', as: 'widget' });
    Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });
    Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });

    // Task associations
    Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
    Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
    Task.belongsTo(Widget, { foreignKey: 'widgetId', as: 'widget' });

    // Alert associations
    Alert.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Alert.belongsTo(DataSource, { foreignKey: 'dataSourceId', as: 'dataSource' });

    // Notification associations
    Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Data associations
    SalesData.belongsTo(DataSource, { foreignKey: 'dataSourceId', as: 'dataSource' });
    InventoryData.belongsTo(DataSource, { foreignKey: 'dataSourceId', as: 'dataSource' });
    CustomerFeedback.belongsTo(DataSource, { foreignKey: 'dataSourceId', as: 'dataSource' });
};

// Initialize associations
defineAssociations();

const db = {
    sequelize,
    Sequelize,
    User,
    Role,
    Dashboard,
    Widget,
    DataSource,
    Alert,
    Comment,
    Task,
    Notification,
    SalesData,
    InventoryData,
    CustomerFeedback
};

module.exports = db;
