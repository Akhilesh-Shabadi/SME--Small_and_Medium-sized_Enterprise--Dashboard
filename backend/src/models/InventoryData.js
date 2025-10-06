module.exports = (sequelize, DataTypes) => {
    const InventoryData = sequelize.define('InventoryData', {
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
        productId: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        productName: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        sku: {
            type: DataTypes.STRING(100)
        },
        category: {
            type: DataTypes.STRING(100)
        },
        currentStock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        minStock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        maxStock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        unitCost: {
            type: DataTypes.DECIMAL(10, 2),
            validate: {
                min: 0
            }
        },
        totalValue: {
            type: DataTypes.DECIMAL(10, 2),
            validate: {
                min: 0
            }
        },
        location: {
            type: DataTypes.STRING(200)
        },
        supplier: {
            type: DataTypes.STRING(200)
        },
        lastRestocked: {
            type: DataTypes.DATE
        },
        lastSold: {
            type: DataTypes.DATE
        },
        status: {
            type: DataTypes.ENUM('in_stock', 'low_stock', 'out_of_stock', 'discontinued'),
            allowNull: false,
            defaultValue: 'in_stock'
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
        tableName: 'inventory_data',
        indexes: [
            {
                fields: ['dataSourceId']
            },
            {
                fields: ['productId']
            },
            {
                fields: ['sku']
            },
            {
                fields: ['category']
            },
            {
                fields: ['status']
            },
            {
                fields: ['timestamp']
            },
            {
                fields: ['currentStock']
            }
        ]
    });

    return InventoryData;
};
