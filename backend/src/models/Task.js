module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 200]
            }
        },
        description: {
            type: DataTypes.TEXT
        },
        widgetId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Widgets',
                key: 'id'
            }
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        assignedTo: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending'
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
            allowNull: false,
            defaultValue: 'medium'
        },
        dueDate: {
            type: DataTypes.DATE
        },
        completedAt: {
            type: DataTypes.DATE
        },
        tags: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {}
        }
    }, {
        tableName: 'tasks',
        indexes: [
            {
                fields: ['widgetId']
            },
            {
                fields: ['createdBy']
            },
            {
                fields: ['assignedTo']
            },
            {
                fields: ['status']
            },
            {
                fields: ['priority']
            },
            {
                fields: ['dueDate']
            }
        ]
    });

    return Task;
};
