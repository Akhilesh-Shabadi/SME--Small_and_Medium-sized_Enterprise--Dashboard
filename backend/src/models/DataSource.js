module.exports = (sequelize, DataTypes) => {
    const DataSource = sequelize.define('DataSource', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        type: {
            type: DataTypes.ENUM('pos', 'ecommerce', 'inventory', 'feedback', 'api', 'file'),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        connectionConfig: {
            type: DataTypes.JSON,
            allowNull: false
        },
        dataSchema: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        refreshInterval: {
            type: DataTypes.INTEGER,
            defaultValue: 60000 // 1 minute
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        lastSync: {
            type: DataTypes.DATE
        },
        syncStatus: {
            type: DataTypes.ENUM('success', 'error', 'pending', 'disabled'),
            defaultValue: 'pending'
        },
        errorMessage: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'data_sources',
        indexes: [
            {
                fields: ['type']
            },
            {
                fields: ['isActive']
            },
            {
                fields: ['syncStatus']
            }
        ]
    });

    return DataSource;
};
