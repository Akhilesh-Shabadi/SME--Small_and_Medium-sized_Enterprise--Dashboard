module.exports = (sequelize, DataTypes) => {
    const SalesData = sequelize.define('SalesData', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        dataSourceId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'DataSources',
                key: 'id'
            }
        },
        transactionId: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        productId: {
            type: DataTypes.STRING(100)
        },
        productName: {
            type: DataTypes.STRING(200)
        },
        category: {
            type: DataTypes.STRING(100)
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        unitPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        tax: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        paymentMethod: {
            type: DataTypes.ENUM('cash', 'card', 'online', 'other')
        },
        customerId: {
            type: DataTypes.STRING(100)
        },
        channel: {
            type: DataTypes.ENUM('pos', 'online', 'mobile', 'other')
        },
        location: {
            type: DataTypes.STRING(200)
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {}
        }
    }, {
        tableName: 'sales_data',
        indexes: [
            {
                fields: ['dataSourceId']
            },
            {
                fields: ['transactionId']
            },
            {
                fields: ['productId']
            },
            {
                fields: ['category']
            },
            {
                fields: ['channel']
            },
            {
                fields: ['timestamp']
            },
            {
                fields: ['customerId']
            }
        ]
    });

    return SalesData;
};
