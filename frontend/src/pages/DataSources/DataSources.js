import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    PlayIcon,
    StopIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DataSourceForm from '../../components/DataSources/DataSourceForm';
import { fetchDataSources, deleteDataSource, testDataSource, syncDataSource } from '../../store/slices/dataSourceSlice';

const DataSources = () => {
    const dispatch = useDispatch();
    const { dataSources, isLoading, error } = useSelector((state) => state.dataSource);
    const [showForm, setShowForm] = useState(false);
    const [editingDataSource, setEditingDataSource] = useState(null);

    useEffect(() => {
        dispatch(fetchDataSources());
    }, [dispatch]);

    const handleAddDataSource = () => {
        setEditingDataSource(null);
        setShowForm(true);
    };

    const handleEditDataSource = (dataSource) => {
        setEditingDataSource(dataSource);
        setShowForm(true);
    };

    const handleDeleteDataSource = async (dataSource) => {
        if (window.confirm(`Are you sure you want to delete "${dataSource.name}"?`)) {
            try {
                await dispatch(deleteDataSource(dataSource.id)).unwrap();
                toast.success('Data source deleted successfully');
            } catch (error) {
                toast.error('Failed to delete data source');
            }
        }
    };

    const handleTestDataSource = async (dataSource) => {
        try {
            await dispatch(testDataSource(dataSource.id)).unwrap();
            toast.success('Data source test initiated');
        } catch (error) {
            toast.error('Failed to test data source');
        }
    };

    const handleSyncDataSource = async (dataSource) => {
        try {
            await dispatch(syncDataSource(dataSource.id)).unwrap();
            toast.success('Data source sync initiated');
        } catch (error) {
            toast.error('Failed to sync data source');
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingDataSource(null);
        dispatch(fetchDataSources());
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            case 'pending':
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
            case 'disabled':
                return <StopIcon className="h-5 w-5 text-gray-500" />;
            default:
                return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'bg-green-100 text-green-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'disabled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'pos':
                return 'bg-blue-100 text-blue-800';
            case 'ecommerce':
                return 'bg-purple-100 text-purple-800';
            case 'inventory':
                return 'bg-green-100 text-green-800';
            case 'feedback':
                return 'bg-yellow-100 text-yellow-800';
            case 'api':
                return 'bg-indigo-100 text-indigo-800';
            case 'file':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Sources</h1>
                    <p className="text-gray-600">Manage your data connections and integrations</p>
                </div>
                <button
                    onClick={handleAddDataSource}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Data Source</span>
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <XCircleIcon className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Sources Grid */}
            {dataSources && dataSources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dataSources.map((dataSource) => (
                        <div
                            key={dataSource.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {dataSource.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {dataSource.description || 'No description'}
                                    </p>
                                    <div className="flex items-center space-x-2 mb-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(dataSource.type)}`}>
                                            {dataSource.type.toUpperCase()}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dataSource.syncStatus)}`}>
                                            {dataSource.syncStatus}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => handleTestDataSource(dataSource)}
                                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Test Connection"
                                    >
                                        <PlayIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleSyncDataSource(dataSource)}
                                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                        title="Sync Data"
                                    >
                                        <CheckCircleIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleEditDataSource(dataSource)}
                                        className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                        title="Edit Data Source"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDataSource(dataSource)}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete Data Source"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Status and Info */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Status:</span>
                                    <div className="flex items-center space-x-1">
                                        {getStatusIcon(dataSource.syncStatus)}
                                        <span className="capitalize">{dataSource.syncStatus}</span>
                                    </div>
                                </div>

                                {dataSource.lastSync && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Last Sync:</span>
                                        <span className="text-gray-900">
                                            {new Date(dataSource.lastSync).toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Refresh:</span>
                                    <span className="text-gray-900">
                                        {Math.round(dataSource.refreshInterval / 1000)}s
                                    </span>
                                </div>

                                {dataSource.errorMessage && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                        {dataSource.errorMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No data sources</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by adding your first data source.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={handleAddDataSource}
                            className="btn btn-primary"
                        >
                            Add Data Source
                        </button>
                    </div>
                </div>
            )}

            {/* Data Source Form Modal */}
            <DataSourceForm
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditingDataSource(null);
                }}
                dataSource={editingDataSource}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
};

export default DataSources;
