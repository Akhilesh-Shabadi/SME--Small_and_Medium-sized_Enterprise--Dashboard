import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { createWidget, updateWidget, fetchDataSources } from '../../store/slices/widgetSlice';

const WidgetForm = ({ isOpen, onClose, dashboardId, widget = null, onSuccess }) => {
    const dispatch = useDispatch();
    const { dataSources, isLoading } = useSelector((state) => state.widget);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'chart',
        dataSourceId: '',
        position: { x: 0, y: 0 },
        size: { w: 4, h: 4 },
        config: {},
        filters: {},
        refreshInterval: 30000,
        isVisible: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchDataSources());
            if (widget) {
                setFormData({
                    title: widget.title || '',
                    description: widget.description || '',
                    type: widget.type || 'chart',
                    dataSourceId: widget.dataSourceId || '',
                    position: widget.position || { x: 0, y: 0 },
                    size: widget.size || { w: 4, h: 4 },
                    config: widget.config || {},
                    filters: widget.filters || {},
                    refreshInterval: widget.refreshInterval || 30000,
                    isVisible: widget.isVisible !== undefined ? widget.isVisible : true
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    type: 'chart',
                    dataSourceId: '',
                    position: { x: 0, y: 0 },
                    size: { w: 4, h: 4 },
                    config: {},
                    filters: {},
                    refreshInterval: 30000,
                    isVisible: true
                });
            }
        }
    }, [isOpen, widget, dispatch]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePositionChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            position: {
                ...prev.position,
                [field]: parseInt(value) || 0
            }
        }));
    };

    const handleSizeChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            size: {
                ...prev.size,
                [field]: parseInt(value) || 1
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (widget) {
                await dispatch(updateWidget({ widgetId: widget.id, widgetData: formData })).unwrap();
                toast.success('Widget updated successfully');
            } else {
                await dispatch(createWidget({ dashboardId, widgetData: formData })).unwrap();
                toast.success('Widget created successfully');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving widget:', error);

            // Check if it's an authentication error
            if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                toast.error('Session expired. Please log in again.');
                // Don't redirect here, let the API interceptor handle it
            } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
                toast.error('You do not have permission to perform this action.');
            } else if (error.message?.includes('404')) {
                toast.error('Dashboard or data source not found.');
            } else if (error.message?.includes('400')) {
                toast.error('Invalid data provided. Please check your inputs.');
            } else {
                toast.error(widget ? 'Failed to update widget' : 'Failed to create widget');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const widgetTypes = [
        { value: 'chart', label: 'Chart', description: 'Display data in various chart formats' },
        { value: 'table', label: 'Table', description: 'Show data in tabular format' },
        { value: 'metric', label: 'Metric', description: 'Display key performance indicators' },
        { value: 'gauge', label: 'Gauge', description: 'Show progress or status with gauge visualization' },
        { value: 'map', label: 'Map', description: 'Display geographical data on maps' },
        { value: 'text', label: 'Text', description: 'Add custom text or notes' }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {widget ? 'Edit Widget' : 'Create New Widget'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter widget title"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter widget description"
                            />
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                Widget Type *
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {widgetTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label} - {type.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="dataSourceId" className="block text-sm font-medium text-gray-700 mb-1">
                                Data Source *
                            </label>
                            {isLoading ? (
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                                    Loading data sources...
                                </div>
                            ) : (
                                <select
                                    id="dataSourceId"
                                    name="dataSourceId"
                                    value={formData.dataSourceId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select a data source</option>
                                    {dataSources.map(source => (
                                        <option key={source.id} value={source.id}>
                                            {source.name} ({source.type})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Layout Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Layout Settings</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="positionX" className="block text-sm font-medium text-gray-700 mb-1">
                                    Position X
                                </label>
                                <input
                                    type="number"
                                    id="positionX"
                                    value={formData.position.x}
                                    onChange={(e) => handlePositionChange('x', e.target.value)}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="positionY" className="block text-sm font-medium text-gray-700 mb-1">
                                    Position Y
                                </label>
                                <input
                                    type="number"
                                    id="positionY"
                                    value={formData.position.y}
                                    onChange={(e) => handlePositionChange('y', e.target.value)}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sizeW" className="block text-sm font-medium text-gray-700 mb-1">
                                    Width
                                </label>
                                <input
                                    type="number"
                                    id="sizeW"
                                    value={formData.size.w}
                                    onChange={(e) => handleSizeChange('w', e.target.value)}
                                    min="1"
                                    max="12"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="sizeH" className="block text-sm font-medium text-gray-700 mb-1">
                                    Height
                                </label>
                                <input
                                    type="number"
                                    id="sizeH"
                                    value={formData.size.h}
                                    onChange={(e) => handleSizeChange('h', e.target.value)}
                                    min="1"
                                    max="12"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>

                        <div>
                            <label htmlFor="refreshInterval" className="block text-sm font-medium text-gray-700 mb-1">
                                Refresh Interval (milliseconds)
                            </label>
                            <input
                                type="number"
                                id="refreshInterval"
                                name="refreshInterval"
                                value={formData.refreshInterval}
                                onChange={handleInputChange}
                                min="5000"
                                max="3600000"
                                step="1000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                How often the widget should refresh its data (5 seconds to 1 hour)
                            </p>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isVisible"
                                name="isVisible"
                                checked={formData.isVisible}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-700">
                                Widget is visible
                            </label>
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
                            {isSubmitting ? 'Saving...' : (widget ? 'Update Widget' : 'Create Widget')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WidgetForm;
