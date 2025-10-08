import React, { useState, useCallback } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const ChartContainer = ({
    title,
    data,
    type = 'bar',
    height = 300,
    onDrillDown,
    drillDownData,
    isDrilledDown = false,
    onBack,
    config = {}
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoveredData, setHoveredData] = useState(null);

    const handleDataClick = useCallback((data) => {
        if (onDrillDown && data) {
            onDrillDown(data);
        }
    }, [onDrillDown]);

    const handleMouseEnter = useCallback((data) => {
        setHoveredData(data);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredData(null);
    }, []);

    const renderChart = () => {
        // Clean data to ensure no NaN values
        const cleanData = (dataArray) => {
            if (!Array.isArray(dataArray)) return [];
            return dataArray.map(item => ({
                ...item,
                value: isNaN(item.value) ? 0 : item.value,
                name: item.name || 'Unknown'
            }));
        };

        const chartData = isDrilledDown ? drillDownData : data;
        const chartProps = {
            data: cleanData(chartData),
            margin: { top: 20, right: 30, left: 20, bottom: 5 },
            onClick: handleDataClick,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave
        };

        switch (type) {
            case 'line':
                return (
                    <LineChart {...chartProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                );

            case 'area':
                return (
                    <AreaChart {...chartProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                        />
                    </AreaChart>
                );

            case 'pie':
                const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                return (
                    <PieChart {...chartProps}>
                        <Pie
                            data={chartProps.data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartProps.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                );

            case 'bar':
            default:
                return (
                    <BarChart {...chartProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                            dataKey="value"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                );
        }
    };

    return (
        <div className={`widget ${isExpanded ? 'fixed inset-0 z-50 bg-white' : ''}`}>
            <div className="widget-header">
                <div className="flex items-center justify-between">
                    <h3 className="widget-title">
                        {isDrilledDown && (
                            <button
                                onClick={onBack}
                                className="mr-2 text-blue-600 hover:text-blue-800"
                            >
                                ← Back
                            </button>
                        )}
                        {title}
                    </h3>

                    <div className="flex items-center space-x-2">
                        {hoveredData && (
                            <div className="text-sm text-gray-600">
                                {hoveredData.name}: {isNaN(hoveredData.value) ? 'N/A' : hoveredData.value}
                            </div>
                        )}

                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title={isExpanded ? 'Minimize' : 'Expand'}
                        >
                            {isExpanded ? (
                                <ChevronDownIcon className="h-4 w-4" />
                            ) : (
                                <ChevronUpIcon className="h-4 w-4" />
                            )}
                        </button>

                        {onDrillDown && !isDrilledDown && (
                            <button
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Drill down available"
                            >
                                <MagnifyingGlassIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="widget-content">
                <div style={{ height: isExpanded ? '80vh' : `${height}px` }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>

                {/* Chart Configuration */}
                {config.showLegend && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {data.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <div
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: item.color || '#3b82f6' }}
                                />
                                <span className="text-sm text-gray-600">
                                    {item.name || 'Unknown'}: {isNaN(item.value) ? 'N/A' : item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Drill-down indicator */}
                {onDrillDown && !isDrilledDown && (
                    <div className="mt-2 text-xs text-gray-500 text-center">
                        Click on data points to drill down
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChartContainer;
