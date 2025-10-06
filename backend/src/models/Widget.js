module.exports = (sequelize, DataTypes) => {
    const Widget = sequelize.define('Widget', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        dashboardId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Dashboards',
                key: 'id'
            }
        },
        dataSourceId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'DataSources',
                key: 'id'
            }
        },
        type: {
            type: DataTypes.ENUM('chart', 'table', 'metric', 'gauge', 'map', 'text'),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        description: {
            type: DataTypes.TEXT
        },
        position: {
            type: DataTypes.JSON,
            allowNull: false
        },
        size: {
            type: DataTypes.JSON,
            allowNull: false
        },
        config: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        filters: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        refreshInterval: {
            type: DataTypes.INTEGER,
            defaultValue: 30000 // 30 seconds
        },
        isVisible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'widgets',
        indexes: [
            {
                fields: ['dashboardId']
            },
            {
                fields: ['dataSourceId']
            },
            {
                fields: ['type']
            }
        ]
    });

    return Widget;
};
