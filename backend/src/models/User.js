module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            field: 'id'
        },
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'first_name',
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'last_name',
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'email',
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'password',
            validate: {
                len: [6, 255]
            }
        },
        roleId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'roleId', // This matches the actual database column
            references: {
                model: 'Roles',
                key: 'id'
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'isActive' // This matches the actual database column
        },
        lastLogin: {
            type: DataTypes.DATE,
            field: 'lastLogin' // This matches the actual database column
        },
        avatar: {
            type: DataTypes.STRING(255),
            field: 'avatar'
        },
        phone: {
            type: DataTypes.STRING(20),
            field: 'phone'
        },
        department: {
            type: DataTypes.STRING(50),
            field: 'department'
        },
        preferences: {
            type: DataTypes.JSON,
            defaultValue: {},
            field: 'preferences'
        }
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'createdAt', // This matches the actual database column
        updatedAt: 'updatedAt', // This matches the actual database column
        indexes: [
            {
                unique: true,
                fields: ['email']
            },
            {
                fields: ['roleId'] // This matches the actual database column
            },
            {
                fields: ['isActive'] // This matches the actual database column
            }
        ]
    });

    return User;
};
