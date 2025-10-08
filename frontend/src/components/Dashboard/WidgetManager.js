import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusIcon, PencilIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import WidgetForm from './WidgetForm';
import WidgetConfigModal from './WidgetConfigModal';
import WidgetPreview from './WidgetPreview';
import { deleteWidget } from '../../store/slices/widgetSlice';

const WidgetManager = ({ dashboard, onAddWidget, onEditWidget, onDeleteWidget, onConfigureWidget }) => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.widget);
    const [isAddingWidget, setIsAddingWidget] = useState(false);
    const [showWidgetForm, setShowWidgetForm] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [editingWidget, setEditingWidget] = useState(null);

    const handleAddWidget = () => {
        setIsAddingWidget(true);
        setShowWidgetForm(true);
        if (onAddWidget) {
            onAddWidget();
        }
    };

    const handleEditWidget = (widget) => {
        setEditingWidget(widget);
        setShowWidgetForm(true);
        if (onEditWidget) {
            onEditWidget(widget);
        }
    };

    const handleDeleteWidget = async (widget) => {
        if (window.confirm('Are you sure you want to delete this widget?')) {
            try {
                await dispatch(deleteWidget(widget.id)).unwrap();
                toast.success('Widget deleted successfully');
                if (onDeleteWidget) {
                    onDeleteWidget(widget);
                }
            } catch (error) {
                toast.error('Failed to delete widget');
                console.error('Error deleting widget:', error);
            }
        }
    };

    const handleConfigureWidget = (widget) => {
        setSelectedWidget(widget);
        setShowConfigModal(true);
        if (onConfigureWidget) {
            onConfigureWidget(widget);
        }
    };

    const handleWidgetFormSuccess = () => {
        setShowWidgetForm(false);
        setEditingWidget(null);
        setIsAddingWidget(false);
        // Refresh dashboard data
        window.location.reload();
    };

    const handleConfigSuccess = () => {
        setShowConfigModal(false);
        setSelectedWidget(null);
        // Refresh dashboard data
        window.location.reload();
    };

    const handleCloseWidgetForm = () => {
        setShowWidgetForm(false);
        setEditingWidget(null);
        setIsAddingWidget(false);
    };

    const handleCloseConfigModal = () => {
        setShowConfigModal(false);
        setSelectedWidget(null);
    };

    const widgetTypes = [
        { type: 'chart', name: 'Chart', description: 'Display data in various chart formats' },
        { type: 'table', name: 'Table', description: 'Show data in tabular format' },
        { type: 'metric', name: 'Metric', description: 'Display key performance indicators' },
        { type: 'text', name: 'Text', description: 'Add custom text or notes' },
        { type: 'image', name: 'Image', description: 'Display images or logos' }
    ];

    return (
        <div className="space-y-6">
            {/* Add Widget Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Add Widget</h3>
                    <button
                        onClick={handleAddWidget}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>Add Widget</span>
                    </button>
                </div>

                {isAddingWidget && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {widgetTypes.map((widgetType) => (
                            <div
                                key={widgetType.type}
                                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => {
                                    setEditingWidget({
                                        type: widgetType.type,
                                        title: `New ${widgetType.name}`,
                                        description: widgetType.description
                                    });
                                    setShowWidgetForm(true);
                                }}
                            >
                                <h4 className="font-medium text-gray-900 mb-2">
                                    {widgetType.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {widgetType.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Existing Widgets */}
            {dashboard?.widgets && dashboard.widgets.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Widgets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dashboard.widgets.map((widget) => (
                            <div
                                key={widget.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 mb-1">
                                            {widget.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {widget.description || 'No description'}
                                        </p>
                                        <div className="text-xs text-gray-500">
                                            Type: {widget.type} |
                                            Data Source: {widget.dataSource?.name || 'None'}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => handleConfigureWidget(widget)}
                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Configure Widget"
                                        >
                                            <Cog6ToothIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditWidget(widget)}
                                            className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                            title="Edit Widget"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWidget(widget)}
                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete Widget"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Widget Preview */}
                                <WidgetPreview widget={widget} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No widgets</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Add widgets to display data and insights.
                    </p>
                </div>
            )}

            {/* Widget Form Modal */}
            <WidgetForm
                isOpen={showWidgetForm}
                onClose={handleCloseWidgetForm}
                dashboardId={dashboard?.id}
                widget={editingWidget}
                onSuccess={handleWidgetFormSuccess}
            />

            {/* Widget Configuration Modal */}
            <WidgetConfigModal
                isOpen={showConfigModal}
                onClose={handleCloseConfigModal}
                widget={selectedWidget}
                onSuccess={handleConfigSuccess}
            />
        </div>
    );
};

export default WidgetManager;
