import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    CogIcon,
    XMarkIcon,
    BellIcon,
    ClockIcon,
    ShieldCheckIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { setError } from '../../store/slices/alertSlice';

const AlertSettings = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { notifications } = useSelector((state) => state.alert);
    const [settings, setSettings] = useState({
        // Notification preferences
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,

        // Alert frequency
        immediateAlerts: true,
        digestFrequency: 'daily', // hourly, daily, weekly
        quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
        },

        // Alert types
        criticalAlerts: true,
        highAlerts: true,
        mediumAlerts: true,
        lowAlerts: false,

        // Data sources
        salesAlerts: true,
        inventoryAlerts: true,
        feedbackAlerts: true,
        systemAlerts: true,

        // Advanced settings
        autoAcknowledge: false,
        escalationEnabled: true,
        escalationDelay: 30, // minutes
        maxAlertsPerHour: 50
    });

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleNestedSettingChange = (parentKey, childKey, value) => {
        setSettings(prev => ({
            ...prev,
            [parentKey]: {
                ...prev[parentKey],
                [childKey]: value
            }
        }));
    };

    const handleSave = async () => {
        try {
            // Here you would typically save settings to the backend
            console.log('Saving alert settings:', settings);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            onClose();
        } catch (error) {
            dispatch(setError('Failed to save settings'));
            console.error('Error saving settings:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <CogIcon className="h-6 w-6 text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900">Alert Settings</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Notification Preferences */}
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                                    <BellIcon className="h-5 w-5 mr-2" />
                                    Notification Preferences
                                </h4>

                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.emailNotifications}
                                            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Email Notifications</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.pushNotifications}
                                            onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Push Notifications</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.smsNotifications}
                                            onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">SMS Notifications</span>
                                    </label>
                                </div>
                            </div>

                            {/* Alert Frequency */}
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                                    <ClockIcon className="h-5 w-5 mr-2" />
                                    Alert Frequency
                                </h4>

                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.immediateAlerts}
                                            onChange={(e) => handleSettingChange('immediateAlerts', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Immediate Alerts</span>
                                    </label>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Digest Frequency
                                        </label>
                                        <select
                                            value={settings.digestFrequency}
                                            onChange={(e) => handleSettingChange('digestFrequency', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                        </select>
                                    </div>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.quietHours.enabled}
                                            onChange={(e) => handleNestedSettingChange('quietHours', 'enabled', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Quiet Hours</span>
                                    </label>

                                    {settings.quietHours.enabled && (
                                        <div className="ml-7 grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600">Start</label>
                                                <input
                                                    type="time"
                                                    value={settings.quietHours.start}
                                                    onChange={(e) => handleNestedSettingChange('quietHours', 'start', e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600">End</label>
                                                <input
                                                    type="time"
                                                    value={settings.quietHours.end}
                                                    onChange={(e) => handleNestedSettingChange('quietHours', 'end', e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Alert Types */}
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                                    Alert Types
                                </h4>

                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.criticalAlerts}
                                            onChange={(e) => handleSettingChange('criticalAlerts', e.target.checked)}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Critical Alerts</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.highAlerts}
                                            onChange={(e) => handleSettingChange('highAlerts', e.target.checked)}
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">High Priority Alerts</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.mediumAlerts}
                                            onChange={(e) => handleSettingChange('mediumAlerts', e.target.checked)}
                                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Medium Priority Alerts</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.lowAlerts}
                                            onChange={(e) => handleSettingChange('lowAlerts', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Low Priority Alerts</span>
                                    </label>
                                </div>
                            </div>

                            {/* Data Sources */}
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                                    <ChartBarIcon className="h-5 w-5 mr-2" />
                                    Data Sources
                                </h4>

                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.salesAlerts}
                                            onChange={(e) => handleSettingChange('salesAlerts', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Sales Data Alerts</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.inventoryAlerts}
                                            onChange={(e) => handleSettingChange('inventoryAlerts', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Inventory Alerts</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.feedbackAlerts}
                                            onChange={(e) => handleSettingChange('feedbackAlerts', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Customer Feedback Alerts</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.systemAlerts}
                                            onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">System Alerts</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Settings */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-md font-semibold text-gray-900 mb-4">Advanced Settings</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.autoAcknowledge}
                                            onChange={(e) => handleSettingChange('autoAcknowledge', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Auto-acknowledge alerts</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.escalationEnabled}
                                            onChange={(e) => handleSettingChange('escalationEnabled', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">Enable escalation</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Escalation Delay (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.escalationDelay}
                                        onChange={(e) => handleSettingChange('escalationDelay', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                        max="1440"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Alerts Per Hour
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.maxAlertsPerHour}
                                        onChange={(e) => handleSettingChange('maxAlertsPerHour', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                        max="1000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            onClick={handleSave}
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Save Settings
                        </button>
                        <button
                            onClick={onClose}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertSettings;
