const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission, PERMISSIONS } = require('../middleware/rbac');

const router = express.Router();

// Generate sample analytics data
const generateSampleData = (timeRange = '7d') => {
    const now = new Date();
    const dataPoints = timeRange === '1d' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    // Generate sales data
    const salesData = Array.from({ length: dataPoints }, (_, i) => {
        const date = new Date(now);
        if (timeRange === '1d') {
            date.setHours(date.getHours() - i);
        } else {
            date.setDate(date.getDate() - i);
        }

        return {
            date: date.toISOString().split('T')[0],
            value: Math.floor(Math.random() * 10000) + 5000,
            category: 'Sales'
        };
    }).reverse();

    // Generate inventory data
    const inventoryData = [
        { name: 'Electronics', value: 450, status: 'In Stock' },
        { name: 'Clothing', value: 320, status: 'Low Stock' },
        { name: 'Books', value: 180, status: 'In Stock' },
        { name: 'Home & Garden', value: 95, status: 'Out of Stock' },
        { name: 'Sports', value: 210, status: 'In Stock' }
    ];

    // Generate customer feedback data
    const feedbackData = [
        { rating: 5, count: 45, percentage: 45 },
        { rating: 4, count: 30, percentage: 30 },
        { rating: 3, count: 15, percentage: 15 },
        { rating: 2, count: 7, percentage: 7 },
        { rating: 1, count: 3, percentage: 3 }
    ];

    return {
        sales: salesData,
        inventory: inventoryData,
        feedback: feedbackData,
        summary: {
            totalRevenue: salesData.reduce((sum, item) => sum + item.value, 0),
            totalItems: inventoryData.reduce((sum, item) => sum + item.value, 0),
            averageRating: 4.2,
            totalOrders: salesData.length
        }
    };
};

// Get analytics data
router.post('/', authenticateToken, requirePermission(PERMISSIONS.ANALYTICS_VIEW), (req, res) => {
    try {
        const { timeRange = '7d' } = req.body;
        const data = generateSampleData(timeRange);

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics data'
        });
    }
});

module.exports = router;
