module.exports = (sequelize, DataTypes) => {
    const CustomerFeedback = sequelize.define('CustomerFeedback', {
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
        customerId: {
            type: DataTypes.STRING(100)
        },
        customerName: {
            type: DataTypes.STRING(200)
        },
        customerEmail: {
            type: DataTypes.STRING(200)
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        title: {
            type: DataTypes.STRING(200)
        },
        comment: {
            type: DataTypes.TEXT
        },
        category: {
            type: DataTypes.ENUM('product', 'service', 'delivery', 'support', 'general')
        },
        productId: {
            type: DataTypes.STRING(100)
        },
        orderId: {
            type: DataTypes.STRING(100)
        },
        channel: {
            type: DataTypes.ENUM('website', 'email', 'phone', 'social', 'review_site', 'other')
        },
        sentiment: {
            type: DataTypes.ENUM('positive', 'neutral', 'negative'),
            allowNull: false
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        response: {
            type: DataTypes.TEXT
        },
        respondedAt: {
            type: DataTypes.DATE
        },
        respondedBy: {
            type: DataTypes.UUID,
            references: {
                model: 'Users',
                key: 'id'
            }
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
        tableName: 'customer_feedback',
        indexes: [
            {
                fields: ['dataSourceId']
            },
            {
                fields: ['customerId']
            },
            {
                fields: ['rating']
            },
            {
                fields: ['category']
            },
            {
                fields: ['channel']
            },
            {
                fields: ['sentiment']
            },
            {
                fields: ['timestamp']
            },
            {
                fields: ['productId']
            }
        ]
    });

    return CustomerFeedback;
};
