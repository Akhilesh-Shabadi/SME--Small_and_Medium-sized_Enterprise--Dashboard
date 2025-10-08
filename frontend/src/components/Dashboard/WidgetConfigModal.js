import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { updateWidget } from '../../store/slices/widgetSlice';

const WidgetConfigModal = ({ isOpen, onClose, widget, onSuccess }) => {
    const dispatch = useDispatch();
    const [config, setConfig] = useState({});
    const [filters, setFilters] = useState({});
    const [refreshInterval, setRefreshInterval] = useState(30000);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && widget) {
            setConfig(widget.config || {});
            setFilters(widget.filters || {});
            setRefreshInterval(widget.refreshInterval || 30000);
        }
    }, [isOpen, widget]);

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await dispatch(updateWidget({
                widgetId: widget.id,
                widgetData: {
                    config,
                    filters,
                    refreshInterval
                }
            })).unwrap();
            toast.success('Widget configuration updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to update widget configuration');
            console.error('Error updating widget config:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderConfigFields = () => {
        if (!widget) return null;

        switch (widget.type) {
            case 'chart':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chart Type
                            </label>
                            <select
                                value={config.chartType || 'line'}
                                onChange={(e) => handleConfigChange('chartType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="line">Line Chart</option>
                                <option value="bar">Bar Chart</option>
                                <option value="pie">Pie Chart</option>
                                <option value="doughnut">Doughnut Chart</option>
                                <option value="area">Area Chart</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                X-Axis Field
                            </label>
                            <input
                                type="text"
                                value={config.xAxis || ''}
                                onChange={(e) => handleConfigChange('xAxis', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., date, category"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Y-Axis Field
                            </label>
                            <input
                                type="text"
                                value={config.yAxis || ''}
                                onChange={(e) => handleConfigChange('yAxis', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., value, amount"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="showLegend"
                                checked={config.showLegend !== false}
                                onChange={(e) => handleConfigChange('showLegend', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showLegend" className="ml-2 block text-sm text-gray-700">
                                Show Legend
                            </label>
                        </div>
                    </div>
                );

            case 'table':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Columns to Display
                            </label>
                            <input
                                type="text"
                                value={config.columns || ''}
                                onChange={(e) => handleConfigChange('columns', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Comma-separated column names"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Items per Page
                            </label>
                            <input
                                type="number"
                                value={config.pageSize || 10}
                                onChange={(e) => handleConfigChange('pageSize', parseInt(e.target.value))}
                                min="5"
                                max="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="sortable"
                                checked={config.sortable !== false}
                                onChange={(e) => handleConfigChange('sortable', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="sortable" className="ml-2 block text-sm text-gray-700">
                                Enable Sorting
                            </label>
                        </div>
                    </div>
                );

            case 'metric':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Value Field
                            </label>
                            <input
                                type="text"
                                value={config.valueField || ''}
                                onChange={(e) => handleConfigChange('valueField', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., total_sales, count"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Format
                            </label>
                            <select
                                value={config.format || 'number'}
                                onChange={(e) => handleConfigChange('format', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="number">Number</option>
                                <option value="currency">Currency</option>
                                <option value="percentage">Percentage</option>
                                <option value="decimal">Decimal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unit
                            </label>
                            <input
                                type="text"
                                value={config.unit || ''}
                                onChange={(e) => handleConfigChange('unit', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., $, %, items"
                            />
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Text Content
                            </label>
                            <textarea
                                value={config.content || ''}
                                onChange={(e) => handleConfigChange('content', e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your text content here..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Text Size
                            </label>
                            <select
                                value={config.textSize || 'medium'}
                                onChange={(e) => handleConfigChange('textSize', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                                <option value="xlarge">Extra Large</option>
                            </select>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8 text-gray-500">
                        <Cog6ToothIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No specific configuration options available for this widget type.</p>
                    </div>
                );
        }
    };

    if (!isOpen || !widget) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Configure Widget: {widget.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Widget Configuration */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Widget Configuration</h3>
                        {renderConfigFields()}
                    </div>

                    {/* Data Filters */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Data Filters</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date Range (days)
                            </label>
                            <input
                                type="number"
                                value={filters.dateRange || 30}
                                onChange={(e) => handleFilterChange('dateRange', parseInt(e.target.value))}
                                min="1"
                                max="365"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Custom Filter (JSON)
                            </label>
                            <textarea
                                value={filters.custom ? JSON.stringify(filters.custom, null, 2) : ''}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        handleFilterChange('custom', parsed);
                                    } catch (error) {
                                        // Invalid JSON, keep the text for editing
                                    }
                                }}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                placeholder='{"field": "value"}'
                            />
                        </div>
                    </div>

                    {/* Refresh Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Refresh Settings</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Refresh Interval (milliseconds)
                            </label>
                            <input
                                type="number"
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                                min="5000"
                                max="3600000"
                                step="1000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Current: {Math.round(refreshInterval / 1000)} seconds
                            </p>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WidgetConfigModal;
