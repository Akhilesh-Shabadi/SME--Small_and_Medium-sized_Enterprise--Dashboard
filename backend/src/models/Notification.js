module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
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
        type: {
            type: DataTypes.ENUM('alert', 'task', 'comment', 'system', 'collaboration'),
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
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        readAt: {
            type: DataTypes.DATE
        },
        actionUrl: {
            type: DataTypes.STRING(500)
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        expiresAt: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'notifications',
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['type']
            },
            {
                fields: ['isRead']
            },
            {
                fields: ['createdAt']
            }
        ]
    });

    return Notification;
};
