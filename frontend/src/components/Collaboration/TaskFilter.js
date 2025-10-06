import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

const TaskFilter = ({ filters, onFilterChange, tasks }) => {
    const handleFilterChange = (key, value) => {
        onFilterChange({ [key]: value });
    };

    // Get unique values for filter options
    const getUniqueValues = (key) => {
        return [...new Set(tasks.map(task => task[key]))].filter(Boolean);
    };

    const statusOptions = ['all', 'pending', 'in_progress', 'completed', 'cancelled'];
    const priorityOptions = ['all', 'low', 'medium', 'high', 'urgent'];
    const assigneeOptions = ['all', ...getUniqueValues('assignedTo')];

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
                            <option key={option} value={option}>
                                {option === 'all' ? 'All Statuses' : option.replace('_', ' ').toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                    <select
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {priorityOptions.map(option => (
                            <option key={option} value={option}>
                                {option === 'all' ? 'All Priorities' : option.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Assignee</label>
                    <select
                        value={filters.assignedTo}
                        onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {assigneeOptions.map(option => (
                            <option key={option} value={option}>
                                {option === 'all' ? 'All Assignees' : option}
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

                {filters.priority !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Priority: {filters.priority}
                        <button
                            onClick={() => handleFilterChange('priority', 'all')}
                            className="ml-1 text-green-600 hover:text-green-800"
                        >
                            ×
                        </button>
                    </span>
                )}

                {filters.assignedTo !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        Assignee: {filters.assignedTo}
                        <button
                            onClick={() => handleFilterChange('assignedTo', 'all')}
                            className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                            ×
                        </button>
                    </span>
                )}

                {(filters.status !== 'all' || filters.priority !== 'all' || filters.assignedTo !== 'all') && (
                    <button
                        onClick={() => onFilterChange({ status: 'all', priority: 'all', assignedTo: 'all' })}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                        Clear all filters
                    </button>
                )}
            </div>
        </div>
    );
};

export default TaskFilter;
