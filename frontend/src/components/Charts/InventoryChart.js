import React, { useState, useMemo } from 'react';
import ChartContainer from './ChartContainer';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const InventoryChart = ({ data = [], onDrillDown }) => {
    const [drillDownData, setDrillDownData] = useState(null);
    const [isDrilledDown, setIsDrilledDown] = useState(false);
    const [drillDownTitle, setDrillDownTitle] = useState('');

    // Process inventory data
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            // Generate sample inventory data
            return [
                { name: 'Product A', value: 45, minStock: 20, maxStock: 100, status: 'low' },
                { name: 'Product B', value: 85, minStock: 30, maxStock: 150, status: 'good' },
                { name: 'Product C', value: 12, minStock: 25, maxStock: 80, status: 'critical' },
                { name: 'Product D', value: 120, minStock: 40, maxStock: 200, status: 'good' },
                { name: 'Product E', value: 8, minStock: 15, maxStock: 60, status: 'critical' },
                { name: 'Product F', value: 65, minStock: 35, maxStock: 120, status: 'good' }
            ];
        }
        return data;
    }, [data]);

    const handleDrillDown = (clickedData) => {
        if (!onDrillDown) return;

        // Simulate drill-down data for inventory history
        const drillDown = generateInventoryHistory(clickedData);

        setDrillDownData(drillDown);
        setIsDrilledDown(true);
        setDrillDownTitle(`${clickedData.name} - Inventory History`);
    };

    const handleBack = () => {
        setDrillDownData(null);
        setIsDrilledDown(false);
        setDrillDownTitle('');
    };

    const generateInventoryHistory = (product) => {
        // Simulate 30 days of inventory history
        return Array.from({ length: 30 }, (_, i) => ({
            name: `Day ${i + 1}`,
            value: Math.max(0, product.value + Math.floor(Math.random() * 20) - 10),
            minStock: product.minStock,
            maxStock: product.maxStock,
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString()
        }));
    };

    const inventoryStats = useMemo(() => {
        const lowStock = chartData.filter(item => item.status === 'low' || item.status === 'critical').length;
        const totalProducts = chartData.length;
        const averageStock = chartData.reduce((sum, item) => sum + item.value, 0) / totalProducts;

        return {
            lowStock,
            totalProducts,
            averageStock: Math.round(averageStock),
            lowStockPercentage: Math.round((lowStock / totalProducts) * 100)
        };
    }, [chartData]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'low': return 'text-yellow-600 bg-yellow-100';
            case 'good': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'critical':
            case 'low':
                return <ExclamationTriangleIcon className="h-4 w-4" />;
            case 'good':
                return <CheckCircleIcon className="h-4 w-4" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                            <p className="text-2xl font-semibold text-red-600">{inventoryStats.lowStock}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-semibold text-gray-900">{inventoryStats.totalProducts}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Average Stock</p>
                            <p className="text-2xl font-semibold text-gray-900">{inventoryStats.averageStock}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Low Stock %</p>
                            <p className="text-2xl font-semibold text-yellow-600">{inventoryStats.lowStockPercentage}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <ChartContainer
                title={isDrilledDown ? drillDownTitle : "Current Inventory Levels"}
                data={chartData}
                type="bar"
                height={400}
                onDrillDown={handleDrillDown}
                drillDownData={drillDownData}
                isDrilledDown={isDrilledDown}
                onBack={handleBack}
                config={{
                    showLegend: false
                }}
            />

            {/* Inventory Status List */}
            {!isDrilledDown && (
                <div className="card">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Status</h4>
                    <div className="space-y-2">
                        {chartData.map((product, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-full ${getStatusColor(product.status)}`}>
                                        {getStatusIcon(product.status)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {product.value} units (Min: {product.minStock}, Max: {product.maxStock})
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${product.status === 'critical' ? 'bg-red-500' :
                                                    product.status === 'low' ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{
                                                width: `${Math.min(100, (product.value / product.maxStock) * 100)}%`
                                            }}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${getStatusColor(product.status)}`}>
                                        {product.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Drill-down Chart for History */}
            {isDrilledDown && drillDownData && (
                <div className="card">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Inventory Trend (Last 30 Days)</h4>
                    <div style={{ height: '300px' }}>
                        <ChartContainer
                            title=""
                            data={drillDownData}
                            type="line"
                            height={300}
                            config={{
                                showLegend: false
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryChart;
