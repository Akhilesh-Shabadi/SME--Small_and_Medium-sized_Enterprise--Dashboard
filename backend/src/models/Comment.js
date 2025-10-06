module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
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
        widgetId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Widgets',
                key: 'id'
            }
        },
        parentId: {
            type: DataTypes.UUID,
            references: {
                model: 'Comments',
                key: 'id'
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 2000]
            }
        },
        mentions: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        isEdited: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        editedAt: {
            type: DataTypes.DATE
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedAt: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'comments',
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['widgetId']
            },
            {
                fields: ['parentId']
            },
            {
                fields: ['isDeleted']
            }
        ]
    });

    return Comment;
};
