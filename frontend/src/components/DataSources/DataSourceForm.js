import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { createDataSource, updateDataSource } from '../../store/slices/dataSourceSlice';

const DataSourceForm = ({ isOpen, onClose, dataSource = null, onSuccess }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        type: 'pos',
        description: '',
        connectionConfig: {},
        dataSchema: {},
        refreshInterval: 60000,
        isActive: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [connectionConfig, setConnectionConfig] = useState({});
    const [dataSchema, setDataSchema] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (dataSource) {
                setFormData({
                    name: dataSource.name || '',
                    type: dataSource.type || 'pos',
                    description: dataSource.description || '',
                    connectionConfig: dataSource.connectionConfig || {},
                    dataSchema: dataSource.dataSchema || {},
                    refreshInterval: dataSource.refreshInterval || 60000,
                    isActive: dataSource.isActive !== undefined ? dataSource.isActive : true
                });
                setConnectionConfig(dataSource.connectionConfig || {});
                setDataSchema(dataSource.dataSchema || {});
            } else {
                setFormData({
                    name: '',
                    type: 'pos',
                    description: '',
                    connectionConfig: {},
                    dataSchema: {},
                    refreshInterval: 60000,
                    isActive: true
                });
                setConnectionConfig({});
                setDataSchema({});
            }
        }
    }, [isOpen, dataSource]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleConnectionConfigChange = (key, value) => {
        const newConfig = { ...connectionConfig, [key]: value };
        setConnectionConfig(newConfig);
        setFormData(prev => ({
            ...prev,
            connectionConfig: newConfig
        }));
    };

    const handleDataSchemaChange = (key, value) => {
        const newSchema = { ...dataSchema, [key]: value };
        setDataSchema(newSchema);
        setFormData(prev => ({
            ...prev,
            dataSchema: newSchema
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (dataSource) {
                await dispatch(updateDataSource({ id: dataSource.id, dataSourceData: formData })).unwrap();
                toast.success('Data source updated successfully');
            } else {
                await dispatch(createDataSource(formData)).unwrap();
                toast.success('Data source created successfully');
            }

            onSuccess();
            onClose();
        } catch (error) {
            toast.error(dataSource ? 'Failed to update data source' : 'Failed to create data source');
            console.error('Error saving data source:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const dataSourceTypes = [
        { value: 'pos', label: 'POS System', description: 'Point of sale data' },
        { value: 'ecommerce', label: 'E-commerce', description: 'Online store data' },
        { value: 'inventory', label: 'Inventory', description: 'Stock and product data' },
        { value: 'feedback', label: 'Customer Feedback', description: 'Reviews and ratings' },
        { value: 'api', label: 'API', description: 'External API data' },
        { value: 'file', label: 'File Upload', description: 'CSV, Excel files' }
    ];

    const renderConnectionConfigFields = () => {
        switch (formData.type) {
            case 'pos':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                API URL
                            </label>
                            <input
                                type="url"
                                value={connectionConfig.apiUrl || ''}
                                onChange={(e) => handleConnectionConfigChange('apiUrl', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://pos-api.example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                API Key
                            </label>
                            <input
                                type="password"
                                value={connectionConfig.apiKey || ''}
                                onChange={(e) => handleConnectionConfigChange('apiKey', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Your API key"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Store ID
                            </label>
                            <input
                                type="text"
                                value={connectionConfig.storeId || ''}
                                onChange={(e) => handleConnectionConfigChange('storeId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="store-001"
                            />
                        </div>
                    </div>
                );

            case 'ecommerce':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Platform
                            </label>
                            <select
                                value={connectionConfig.platform || 'shopify'}
                                onChange={(e) => handleConnectionConfigChange('platform', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="shopify">Shopify</option>
                                <option value="woocommerce">WooCommerce</option>
                                <option value="magento">Magento</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Shop Domain
                            </label>
                            <input
                                type="text"
                                value={connectionConfig.shopDomain || ''}
                                onChange={(e) => handleConnectionConfigChange('shopDomain', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="mystore.myshopify.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Access Token
                            </label>
                            <input
                                type="password"
                                value={connectionConfig.accessToken || ''}
                                onChange={(e) => handleConnectionConfigChange('accessToken', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Your access token"
                            />
                        </div>
                    </div>
                );

            case 'api':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                API URL
                            </label>
                            <input
                                type="url"
                                value={connectionConfig.apiUrl || ''}
                                onChange={(e) => handleConnectionConfigChange('apiUrl', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://api.example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                API Key
                            </label>
                            <input
                                type="password"
                                value={connectionConfig.apiKey || ''}
                                onChange={(e) => handleConnectionConfigChange('apiKey', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Your API key"
                            />
                        </div>
                    </div>
                );

            case 'file':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                File Path
                            </label>
                            <input
                                type="text"
                                value={connectionConfig.filePath || ''}
                                onChange={(e) => handleConnectionConfigChange('filePath', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="/uploads/data/"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                File Format
                            </label>
                            <select
                                value={connectionConfig.fileFormat || 'csv'}
                                onChange={(e) => handleConnectionConfigChange('fileFormat', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="csv">CSV</option>
                                <option value="excel">Excel</option>
                                <option value="json">JSON</option>
                            </select>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8 text-gray-500">
                        <p>No specific configuration required for this data source type.</p>
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {dataSource ? 'Edit Data Source' : 'Create New Data Source'}
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
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter data source name"
                            />
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                Type *
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {dataSourceTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label} - {type.description}
                                    </option>
                                ))}
                            </select>
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
                                placeholder="Enter data source description"
                            />
                        </div>
                    </div>

                    {/* Connection Configuration */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Connection Configuration</h3>
                        {renderConnectionConfigFields()}
                    </div>

                    {/* Data Schema */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Data Schema</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Schema (JSON)
                            </label>
                            <textarea
                                value={JSON.stringify(dataSchema, null, 2)}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        setDataSchema(parsed);
                                        setFormData(prev => ({
                                            ...prev,
                                            dataSchema: parsed
                                        }));
                                    } catch (error) {
                                        // Invalid JSON, keep the text for editing
                                    }
                                }}
                                rows={8}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                placeholder='{"table_name": {"fields": ["field1", "field2"], "primaryKey": "field1"}}'
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Settings</h3>

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
                                min="10000"
                                max="3600000"
                                step="1000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                How often to sync data (10 seconds to 1 hour)
                            </p>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                Data source is active
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
                            {isSubmitting ? 'Saving...' : (dataSource ? 'Update Data Source' : 'Create Data Source')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DataSourceForm;
