module.exports = (sequelize, DataTypes) => {
    const Dashboard = sequelize.define('Dashboard', {
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
        description: {
            type: DataTypes.TEXT
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        layout: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        settings: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'dashboards',
        indexes: [
            {
                fields: ['createdBy']
            },
            {
                fields: ['isPublic']
            },
            {
                fields: ['isActive']
            }
        ]
    });

    return Dashboard;
};
