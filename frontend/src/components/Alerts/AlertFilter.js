import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

const AlertFilter = ({ filters, onFilterChange, alerts }) => {
    const handleFilterChange = (key, value) => {
        onFilterChange({ [key]: value });
    };

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'triggered', label: 'Triggered' },
        { value: 'not_triggered', label: 'Not Triggered' }
    ];

    const severityOptions = [
        { value: 'all', label: 'All Severities' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' }
    ];

    const typeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'threshold', label: 'Threshold' },
        { value: 'anomaly', label: 'Anomaly' },
        { value: 'system', label: 'System' },
        { value: 'custom', label: 'Custom' }
    ];

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
                <FunnelIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                    <select
                        value={filters.severity}
                        onChange={(e) => handleFilterChange('severity', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {severityOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {typeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active filters display */}
            <div className="mt-3 flex flex-wrap gap-2">
                {filters.status !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Status: {filters.status.replace('_', ' ')}
                        <button
                            onClick={() => handleFilterChange('status', 'all')}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                            ×
                        </button>
                    </span>
                )}

                {filters.severity !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Severity: {filters.severity}
                        <button
                            onClick={() => handleFilterChange('severity', 'all')}
                            className="ml-1 text-green-600 hover:text-green-800"
                        >
                            ×
                        </button>
                    </span>
                )}

                {filters.type !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        Type: {filters.type}
                        <button
                            onClick={() => handleFilterChange('type', 'all')}
                            className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                            ×
                        </button>
                    </span>
                )}

                {(filters.status !== 'all' || filters.severity !== 'all' || filters.type !== 'all') && (
                    <button
                        onClick={() => onFilterChange({ status: 'all', severity: 'all', type: 'all' })}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                        Clear all filters
                    </button>
                )}
            </div>
        </div>
    );
};

export default AlertFilter;
