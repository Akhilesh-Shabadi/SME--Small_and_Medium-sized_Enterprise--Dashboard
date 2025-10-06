module.exports = (sequelize, DataTypes) => {
    const Alert = sequelize.define('Alert', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
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
            type: DataTypes.ENUM('threshold', 'anomaly', 'system', 'custom'),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 200]
            }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        severity: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
            allowNull: false,
            defaultValue: 'medium'
        },
        condition: {
            type: DataTypes.JSON,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        isTriggered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        triggeredAt: {
            type: DataTypes.DATE
        },
        acknowledgedAt: {
            type: DataTypes.DATE
        },
        acknowledgedBy: {
            type: DataTypes.UUID,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }, {
        tableName: 'alerts',
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['dataSourceId']
            },
            {
                fields: ['type']
            },
            {
                fields: ['severity']
            },
            {
                fields: ['isActive']
            },
            {
                fields: ['isTriggered']
            }
        ]
    });

    return Alert;
};
