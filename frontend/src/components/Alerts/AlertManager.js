import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addAlert, updateAlert, removeAlert, setAlerts, setLoading, setError, addNotification } from '../../store/slices/alertSlice';
import { alertService } from '../../services/alertService';
import AlertItem from './AlertItem';
import AlertForm from './AlertForm';
import AlertFilter from './AlertFilter';
import BulkActions from './BulkActions';
import ExportAlerts from './ExportAlerts';
import LoadingSpinner from '../UI/LoadingSpinner';

const AlertManager = ({ showCreateAlert = false, onCloseCreateAlert }) => {
    const dispatch = useDispatch();
    const { alerts, isLoading, error } = useSelector((state) => state.alert);
    const [showForm, setShowForm] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        severity: 'all',
        type: 'all',
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        currentPage: 1
    });
    const [selectedAlerts, setSelectedAlerts] = useState([]);
    const [showExportModal, setShowExportModal] = useState(false);

    // Handle external create alert trigger
    useEffect(() => {
        if (showCreateAlert) {
            setShowForm(true);
        }
    }, [showCreateAlert]);

    // Fetch alerts on component mount and filter changes
    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                dispatch(setLoading(true));
                dispatch(setError(null));
                const response = await alertService.getAlerts(filters);
                dispatch(setAlerts(response.data?.alerts || []));
                setPagination(response.data?.pagination || { total: 0, pages: 0, currentPage: 1 });
            } catch (error) {
                console.error('Error fetching alerts:', error);
                dispatch(setError('Failed to fetch alerts. Please check your connection and try again.'));

                // Set mock data for development when backend is not available
                const mockAlerts = [
                    {
                        id: 'mock-1',
                        title: 'Low Inventory Alert',
                        message: 'Product A inventory is below threshold (5 units remaining)',
                        severity: 'critical',
                        type: 'threshold',
                        isTriggered: true,
                        isActive: true,
                        triggeredAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                        user: {
                            id: 'user1',
                            firstName: 'System',
                            lastName: 'Alert',
                            email: 'system@example.com'
                        }
                    },
                    {
                        id: 'mock-2',
                        title: 'Sales Target Warning',
                        message: 'Weekly sales target not met (75% of target achieved)',
                        severity: 'high',
                        type: 'threshold',
                        isTriggered: true,
                        isActive: true,
                        triggeredAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                        user: {
                            id: 'user1',
                            firstName: 'System',
                            lastName: 'Alert',
                            email: 'system@example.com'
                        }
                    }
                ];

                dispatch(setAlerts(mockAlerts));
                setPagination({ total: mockAlerts.length, pages: 1, currentPage: 1 });
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchAlerts();
    }, [dispatch, filters]);

    // WebSocket connection for real-time updates
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Initialize WebSocket connection
        const ws = new WebSocket(`ws://localhost:5000/ws?token=${token}`);

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'alert_triggered':
                        // Add new alert to the list
                        dispatch(addAlert(data.alert));
                        // Add notification
                        dispatch(addNotification({
                            id: `alert-${data.alert.id}`,
                            type: 'alert',
                            title: data.alert.title,
                            message: data.alert.message,
                            timestamp: new Date().toISOString(),
                            isRead: false,
                            actionUrl: `/dashboard/alerts/${data.alert.id}`,
                            metadata: {
                                alertId: data.alert.id,
                                alertType: data.alert.type,
                                severity: data.alert.severity
                            }
                        }));
                        break;
                    case 'alert_updated':
                        dispatch(updateAlert(data.alert));
                        break;
                    case 'alert_deleted':
                        dispatch(removeAlert(data.alertId));
                        break;
                    case 'notification':
                        dispatch(addNotification(data.notification));
                        break;
                    default:
                        console.log('Unknown WebSocket message type:', data.type);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [dispatch]);

    // Handle pagination
    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleLimitChange = (newLimit) => {
        setFilters({ ...filters, limit: parseInt(newLimit), page: 1 });
    };

    const handleCreateAlert = async (alertData) => {
        try {
            dispatch(setLoading(true));
            const response = await alertService.createAlert(alertData);
            dispatch(addAlert(response.data.alert));
            setShowForm(false);
            // Notify parent component that create alert is complete
            if (onCloseCreateAlert) {
                onCloseCreateAlert();
            }
        } catch (error) {
            dispatch(setError('Failed to create alert'));
            console.error('Error creating alert:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleUpdateAlert = async (alertId, updateData) => {
        try {
            dispatch(setLoading(true));
            const response = await alertService.updateAlert(alertId, updateData);
            dispatch(updateAlert(response.data.alert));
            setEditingAlert(null);
        } catch (error) {
            dispatch(setError('Failed to update alert'));
            console.error('Error updating alert:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleDeleteAlert = async (alertId) => {
        try {
            dispatch(setLoading(true));
            await alertService.deleteAlert(alertId);
            dispatch(removeAlert(alertId));
        } catch (error) {
            dispatch(setError('Failed to delete alert'));
            console.error('Error deleting alert:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleAcknowledgeAlert = async (alertId) => {
        try {
            dispatch(setLoading(true));
            const response = await alertService.acknowledgeAlert(alertId);
            dispatch(updateAlert(response.data.alert));
        } catch (error) {
            dispatch(setError('Failed to acknowledge alert'));
            console.error('Error acknowledging alert:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters, page: 1 });
        setSelectedAlerts([]); // Clear selection when filters change
    };

    const handleSelectAlert = (alertId, isSelected) => {
        if (isSelected) {
            setSelectedAlerts([...selectedAlerts, alertId]);
        } else {
            setSelectedAlerts(selectedAlerts.filter(id => id !== alertId));
        }
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedAlerts(alerts.map(alert => alert.id));
        } else {
            setSelectedAlerts([]);
        }
    };

    const handleBulkActionComplete = (action, alertIds) => {
        // Refresh alerts after bulk action
        const fetchAlerts = async () => {
            try {
                dispatch(setLoading(true));
                const response = await alertService.getAlerts(filters);
                dispatch(setAlerts(response.data.alerts));
                setPagination(response.data.pagination);
            } catch (error) {
                dispatch(setError('Failed to refresh alerts'));
                console.error('Error refreshing alerts:', error);
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchAlerts();
    };

    const getAlertCounts = () => {
        return {
            total: pagination.total || alerts.length,
            triggered: alerts.filter(a => a.isTriggered).length,
            acknowledged: alerts.filter(a => a.acknowledgedAt).length,
            active: alerts.filter(a => a.isActive).length
        };
    };

    const counts = getAlertCounts();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <div className="flex items-center justify-between">
                        <span>{error}</span>
                        <button
                            onClick={() => dispatch(setError(null))}
                            className="text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Alerts ({counts.total})
                    </h3>
                    <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                        <span>Triggered: {counts.triggered}</span>
                        <span>Acknowledged: {counts.acknowledged}</span>
                        <span>Active: {counts.active}</span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="btn btn-outline text-sm"
                    >
                        Export
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn btn-primary text-sm"
                    >
                        {showForm ? 'Cancel' : 'Create Alert'}
                    </button>
                </div>
            </div>

            <AlertFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                alerts={alerts}
            />

            <BulkActions
                selectedAlerts={selectedAlerts}
                onSelectionChange={setSelectedAlerts}
                onBulkActionComplete={handleBulkActionComplete}
            />

            {showForm && (
                <AlertForm
                    onSubmit={handleCreateAlert}
                    onCancel={() => {
                        setShowForm(false);
                        if (onCloseCreateAlert) {
                            onCloseCreateAlert();
                        }
                    }}
                />
            )}

            <div className="space-y-3">
                {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No alerts found.</p>
                        {pagination.total === 0 && (
                            <p className="mt-1">Create your first alert to get started!</p>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Select All Checkbox */}
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                checked={selectedAlerts.length === alerts.length && alerts.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Select all ({alerts.length} alerts)
                            </label>
                        </div>

                        {alerts.map((alert, index) => {
                            // Ensure alert has required properties
                            const safeAlert = {
                                id: alert.id || `alert-${index}`,
                                title: alert.title || 'Untitled Alert',
                                message: alert.message || 'No message',
                                severity: alert.severity || 'medium',
                                type: alert.type || 'custom',
                                isTriggered: alert.isTriggered || false,
                                isActive: alert.isActive !== undefined ? alert.isActive : true,
                                acknowledgedAt: alert.acknowledgedAt || null,
                                timestamp: alert.timestamp || new Date().toISOString(),
                                user: alert.user || { firstName: 'Unknown', lastName: 'User' },
                                ...alert
                            };

                            return (
                                <div key={`${safeAlert.id}-${index}`} className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedAlerts.includes(safeAlert.id)}
                                        onChange={(e) => handleSelectAlert(safeAlert.id, e.target.checked)}
                                        className="mt-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div className="flex-1">
                                        <AlertItem
                                            alert={safeAlert}
                                            onUpdate={handleUpdateAlert}
                                            onDelete={handleDeleteAlert}
                                            onAcknowledge={handleAcknowledgeAlert}
                                            isEditing={editingAlert === safeAlert.id}
                                            onEdit={() => setEditingAlert(safeAlert.id)}
                                            onCancelEdit={() => setEditingAlert(null)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Show</span>
                        <select
                            value={filters.limit}
                            onChange={(e) => handleLimitChange(e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-700">per page</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">
                            Page {pagination.currentPage} of {pagination.pages}
                        </span>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage <= 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage >= pagination.pages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ExportAlerts
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                selectedAlerts={selectedAlerts}
            />
        </div>
    );
};

export default AlertManager;
