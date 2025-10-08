import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SalesChart from '../../components/Charts/SalesChart';
import InventoryChart from '../../components/Charts/InventoryChart';
import CustomerFeedbackChart from '../../components/Charts/CustomerFeedbackChart';
import ChartContainer from '../../components/Charts/ChartContainer';
import { fetchAnalyticsData } from '../../store/slices/analyticsSlice';

const Analytics = () => {
    const dispatch = useDispatch();
    const { data: analyticsData, isLoading, error } = useSelector((state) => state.analytics);
    const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
    const [selectedMetric, setSelectedMetric] = useState('sales');

    useEffect(() => {
        dispatch(fetchAnalyticsData({ timeRange: selectedTimeRange }));
    }, [dispatch, selectedTimeRange]);

    // Provide default data structure if analyticsData is undefined
    const safeAnalyticsData = analyticsData || {
        sales: [],
        inventory: [],
        feedback: []
    };

    // Sample revenue data for demonstration
    const revenueData = [
        { name: 'Jan', value: 45000, category: 'Revenue' },
        { name: 'Feb', value: 52000, category: 'Revenue' },
        { name: 'Mar', value: 48000, category: 'Revenue' },
        { name: 'Apr', value: 61000, category: 'Revenue' },
        { name: 'May', value: 55000, category: 'Revenue' },
        { name: 'Jun', value: 67000, category: 'Revenue' }
    ];

    const handleDrillDown = (data) => {
        console.log('Drill down to:', data);
        // In a real app, this would trigger more detailed data fetching
    };

    const timeRangeOptions = [
        { value: '1d', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' },
        { value: '1y', label: 'Last Year' }
    ];

    const metricOptions = [
        { value: 'sales', label: 'Sales' },
        { value: 'inventory', label: 'Inventory' },
        { value: 'feedback', label: 'Customer Feedback' },
        { value: 'revenue', label: 'Revenue' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600">Real-time analytics and insights with interactive drill-down capabilities</p>
                </div>

                <div className="mt-4 sm:mt-0 flex space-x-4">
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {timeRangeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {metricOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-semibold text-gray-900">$324,000</p>
                            <p className="text-sm text-green-600">+12.5% from last month</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Sales Growth</p>
                            <p className="text-2xl font-semibold text-gray-900">+18.2%</p>
                            <p className="text-sm text-green-600">+2.1% from last week</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Inventory Items</p>
                            <p className="text-2xl font-semibold text-gray-900">1,247</p>
                            <p className="text-sm text-red-600">-3 items low stock</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Customer Rating</p>
                            <p className="text-2xl font-semibold text-gray-900">4.2</p>
                            <p className="text-sm text-green-600">+0.3 from last month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Charts */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading analytics data...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error loading analytics data</h3>
                                <p className="mt-1 text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <SalesChart
                            data={safeAnalyticsData.sales || []}
                            onDrillDown={handleDrillDown}
                            timeRange={selectedTimeRange}
                        />

                        <InventoryChart
                            data={safeAnalyticsData.inventory || []}
                            onDrillDown={handleDrillDown}
                            timeRange={selectedTimeRange}
                        />

                        <CustomerFeedbackChart
                            data={safeAnalyticsData.feedback || []}
                            onDrillDown={handleDrillDown}
                            timeRange={selectedTimeRange}
                        />
                    </>
                )}

                {/* Revenue Trend Chart */}
                <ChartContainer
                    title="Revenue Trend (Last 6 Months)"
                    data={revenueData}
                    type="area"
                    height={400}
                    onDrillDown={handleDrillDown}
                    config={{
                        showLegend: false
                    }}
                />
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Product A', sales: 1250, growth: '+15%' },
                            { name: 'Product B', sales: 980, growth: '+8%' },
                            { name: 'Product C', sales: 750, growth: '+22%' },
                            { name: 'Product D', sales: 620, growth: '+5%' }
                        ].map((product, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.sales} units sold</p>
                                </div>
                                <span className="text-sm font-medium text-green-600">{product.growth}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Peak Sales Time:</strong> 2-4 PM shows highest conversion rates
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>Inventory Alert:</strong> Product C is running low, consider restocking
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Customer Feedback:</strong> Recent reviews mention packaging improvements
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
