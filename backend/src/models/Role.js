module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'name',
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
        description: {
            type: DataTypes.TEXT,
            field: 'description'
        },
        permissions: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            field: 'permissions'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'isActive' // This matches the actual database column
        }
    }, {
        tableName: 'roles',
        timestamps: true,
        createdAt: 'createdAt', // This matches the actual database column
        updatedAt: 'updatedAt', // This matches the actual database column
        indexes: [
            {
                unique: true,
                fields: ['name']
            }
        ]
    });

    return Role;
};
