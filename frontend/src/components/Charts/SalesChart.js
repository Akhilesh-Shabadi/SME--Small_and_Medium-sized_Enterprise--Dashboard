import React, { useState, useMemo } from 'react';
import ChartContainer from './ChartContainer';
import { format, subDays } from 'date-fns';

const SalesChart = ({ data = [], onDrillDown, timeRange = '7d' }) => {
    const [drillDownData, setDrillDownData] = useState(null);
    const [isDrilledDown, setIsDrilledDown] = useState(false);
    const [drillDownTitle, setDrillDownTitle] = useState('');

    // Process data for different time periods
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            // Generate sample data based on time range
            const getDaysFromTimeRange = (range) => {
                switch (range) {
                    case '1d': return 24; // 24 hours
                    case '7d': return 7;
                    case '30d': return 30;
                    case '90d': return 90;
                    case '1y': return 12; // 12 months
                    default: return 7;
                }
            };

            const days = getDaysFromTimeRange(timeRange);
            const isHourly = timeRange === '1d';
            const isMonthly = timeRange === '1y';

            return Array.from({ length: days }, (_, i) => {
                let date, name;
                try {
                    if (isHourly) {
                        date = new Date(Date.now() - (days - 1 - i) * 60 * 60 * 1000);
                        name = format(date, 'HH:mm');
                    } else if (isMonthly) {
                        date = subDays(new Date(), (days - 1 - i) * 30);
                        name = format(date, 'MMM yyyy');
                    } else {
                        date = subDays(new Date(), days - 1 - i);
                        name = format(date, 'MMM dd');
                    }
                } catch (error) {
                    // Fallback if date formatting fails
                    date = new Date();
                    name = `Day ${i + 1}`;
                }

                return {
                    name: name || `Day ${i + 1}`,
                    value: Math.floor(Math.random() * 1000) + 500,
                    date: date.toISOString(),
                    category: 'All Products'
                };
            });
        }
        return data;
    }, [data, timeRange]);

    const handleDrillDown = (clickedData) => {
        if (!onDrillDown) return;

        // Simulate drill-down data (in real app, this would come from API)
        const drillDown = generateDrillDownData(clickedData);

        setDrillDownData(drillDown);
        setIsDrilledDown(true);
        setDrillDownTitle(`${clickedData.name || 'Selected Date'} - Product Breakdown`);
    };

    const handleBack = () => {
        setDrillDownData(null);
        setIsDrilledDown(false);
        setDrillDownTitle('');
    };

    // Generate dynamic title based on time range
    const getChartTitle = () => {
        if (isDrilledDown) return drillDownTitle;

        const timeRangeLabels = {
            '1d': 'Last 24 Hours',
            '7d': 'Last 7 Days',
            '30d': 'Last 30 Days',
            '90d': 'Last 90 Days',
            '1y': 'Last Year'
        };

        return `Sales Trend (${timeRangeLabels[timeRange] || 'Last 7 Days'})`;
    };

    const generateDrillDownData = (parentData) => {
        // Simulate product breakdown for the selected date
        const products = ['Product A', 'Product B', 'Product C', 'Product D'];
        return products.map(product => ({
            name: product,
            value: Math.floor(Math.random() * 300) + 100,
            category: product,
            date: parentData.date
        }));
    };

    const totalSales = useMemo(() => {
        const dataToSum = isDrilledDown ? drillDownData : chartData;
        return dataToSum?.reduce((sum, item) => sum + item.value, 0) || 0;
    }, [chartData, drillDownData, isDrilledDown]);

    const averageSales = useMemo(() => {
        const dataToAvg = isDrilledDown ? drillDownData : chartData;
        return dataToAvg?.length > 0 ? totalSales / dataToAvg.length : 0;
    }, [totalSales, chartData, drillDownData, isDrilledDown]);

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Sales</p>
                            <p className="text-2xl font-semibold text-gray-900">${totalSales.toLocaleString()}</p>
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
                            <p className="text-sm font-medium text-gray-600">Average Daily</p>
                            <p className="text-2xl font-semibold text-gray-900">${Math.round(averageSales).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                            <p className="text-2xl font-semibold text-gray-900">+12.5%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <ChartContainer
                title={getChartTitle()}
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

            {/* Additional Insights */}
            {!isDrilledDown && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Top Performing Day</h4>
                        <p className="text-lg font-semibold text-gray-900">
                            {chartData.reduce((max, day) => day.value > max.value ? day : max, chartData[0])?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                            ${chartData.reduce((max, day) => day.value > max.value ? day : max, chartData[0])?.value.toLocaleString()}
                        </p>
                    </div>

                    <div className="card">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Trend Analysis</h4>
                        <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">75% of target</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesChart;
