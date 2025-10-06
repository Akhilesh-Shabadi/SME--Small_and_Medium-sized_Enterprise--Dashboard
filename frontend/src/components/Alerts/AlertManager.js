import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addAlert, updateAlert, removeAlert } from '../../store/slices/alertSlice';
import AlertItem from './AlertItem';
import AlertForm from './AlertForm';
import AlertFilter from './AlertFilter';
import LoadingSpinner from '../UI/LoadingSpinner';

const AlertManager = () => {
    const dispatch = useDispatch();
    const { alerts, isLoading } = useSelector((state) => state.alert);
    const { user } = useSelector((state) => state.auth);
    const [showForm, setShowForm] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        severity: 'all',
        type: 'all'
    });

    // Apply filters
    const filteredAlerts = alerts.filter(alert => {
        if (filters.status !== 'all') {
            const isTriggered = filters.status === 'triggered';
            if (alert.isTriggered !== isTriggered) return false;
        }
        if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
        if (filters.type !== 'all' && alert.type !== filters.type) return false;
        return true;
    });

    const handleCreateAlert = async (alertData) => {
        try {
            const newAlert = {
                id: Date.now().toString(), // Temporary ID
                userId: user.id,
                dataSourceId: alertData.dataSourceId,
                type: alertData.type,
                title: alertData.title,
                message: alertData.message,
                severity: alertData.severity || 'medium',
                condition: alertData.condition,
                isActive: true,
                isTriggered: false,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                },
                timestamp: new Date().toISOString()
            };

            // Add to Redux store immediately for optimistic update
            dispatch(addAlert(newAlert));

            setShowForm(false);
        } catch (error) {
            console.error('Error creating alert:', error);
        }
    };

    const handleUpdateAlert = async (alertId, updateData) => {
        try {
            // Update in Redux store
            dispatch(updateAlert({ id: alertId, ...updateData }));

            setEditingAlert(null);
        } catch (error) {
            console.error('Error updating alert:', error);
        }
    };

    const handleDeleteAlert = async (alertId) => {
        try {
            // Remove from Redux store
            dispatch(removeAlert(alertId));
        } catch (error) {
            console.error('Error deleting alert:', error);
        }
    };

    const handleAcknowledgeAlert = async (alertId) => {
        try {
            // Update in Redux store
            dispatch(updateAlert({
                id: alertId,
                acknowledgedAt: new Date().toISOString(),
                acknowledgedBy: user.id
            }));
        } catch (error) {
            console.error('Error acknowledging alert:', error);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const getAlertCounts = () => {
        return {
            total: alerts.length,
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
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary text-sm"
                >
                    {showForm ? 'Cancel' : 'Create Alert'}
                </button>
            </div>

            <AlertFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                alerts={alerts}
            />

            {showForm && (
                <AlertForm
                    onSubmit={handleCreateAlert}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No alerts found.</p>
                        {alerts.length === 0 && (
                            <p className="mt-1">Create your first alert to get started!</p>
                        )}
                    </div>
                ) : (
                    filteredAlerts.map((alert, index) => (
                        <AlertItem
                            key={`${alert.id}-${index}`}
                            alert={alert}
                            onUpdate={handleUpdateAlert}
                            onDelete={handleDeleteAlert}
                            onAcknowledge={handleAcknowledgeAlert}
                            isEditing={editingAlert === alert.id}
                            onEdit={() => setEditingAlert(alert.id)}
                            onCancelEdit={() => setEditingAlert(null)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertManager;
