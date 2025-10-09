import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AlertManager from '../../components/Alerts/AlertManager';
import NotificationCenter from '../../components/Alerts/NotificationCenter';
import AlertSettings from '../../components/Alerts/AlertSettings';
import { addAlert, addNotification } from '../../store/slices/alertSlice';

const Alerts = () => {
    const dispatch = useDispatch();
    const { alerts, notifications } = useSelector((state) => state.alert);
    const [showNotificationCenter, setShowNotificationCenter] = useState(false);
    const [showAlertSettings, setShowAlertSettings] = useState(false);
    const [showCreateAlert, setShowCreateAlert] = useState(false);

    useEffect(() => {
        // Simulate some sample alerts for demonstration
        const sampleAlerts = [
            {
                id: '1',
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
                id: '2',
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
            },
            {
                id: '3',
                title: 'New Customer Feedback',
                message: 'New customer feedback received for Product B',
                severity: 'low',
                type: 'system',
                isTriggered: false,
                isActive: true,
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: 'user1',
                    firstName: 'System',
                    lastName: 'Alert',
                    email: 'system@example.com'
                }
            }
        ];

        // Add sample alerts if not already present
        if (alerts.length === 0) {
            sampleAlerts.forEach(alert => {
                dispatch(addAlert(alert));
            });
        }
    }, [dispatch, alerts.length]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
                <p className="text-gray-600">Monitor system alerts and notifications</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Alert Statistics */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Statistics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Alerts</span>
                                <span className="text-lg font-semibold text-gray-900">{alerts.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Triggered</span>
                                <span className="text-lg font-semibold text-red-600">
                                    {alerts.filter(a => a.isTriggered).length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Active</span>
                                <span className="text-lg font-semibold text-green-600">
                                    {alerts.filter(a => a.isActive).length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Unread Notifications</span>
                                <span className="text-lg font-semibold text-blue-600">
                                    {notifications.filter(n => !n.isRead).length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowCreateAlert(true)}
                                className="w-full btn btn-primary text-sm"
                            >
                                Create New Alert
                            </button>
                            <button
                                onClick={() => setShowNotificationCenter(true)}
                                className="w-full btn btn-outline text-sm"
                            >
                                View All Notifications
                            </button>
                            <button
                                onClick={() => setShowAlertSettings(true)}
                                className="w-full btn btn-outline text-sm"
                            >
                                Alert Settings
                            </button>
                        </div>
                    </div>
                </div>

                {/* Alert Manager */}
                <div className="lg:col-span-2">
                    <AlertManager
                        showCreateAlert={showCreateAlert}
                        onCloseCreateAlert={() => setShowCreateAlert(false)}
                    />
                </div>
            </div>

            {/* Recent Notifications */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No notifications yet.</p>
                        </div>
                    ) : (
                        notifications.slice(0, 5).map((notification) => (
                            <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-white">N</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                        <p className="text-xs text-gray-500">{notification.message}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${notification.isRead ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {notification.isRead ? 'Read' : 'Unread'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(notification.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modals */}
            <NotificationCenter
                isOpen={showNotificationCenter}
                onClose={() => setShowNotificationCenter(false)}
            />

            <AlertSettings
                isOpen={showAlertSettings}
                onClose={() => setShowAlertSettings(false)}
            />
        </div>
    );
};

export default Alerts;
