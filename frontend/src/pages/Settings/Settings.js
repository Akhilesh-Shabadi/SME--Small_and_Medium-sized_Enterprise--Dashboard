import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import UserRoleManager from '../../components/RBAC/UserRoleManager';
import PermissionGate from '../../components/RBAC/PermissionGate';
import RoleBadge from '../../components/RBAC/RoleBadge';
import {
    UserIcon,
    CogIcon,
    BellIcon,
    ShieldCheckIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', name: 'General', icon: CogIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'users', name: 'User Management', icon: UserIcon, permission: 'users:view' },
        { id: 'permissions', name: 'Permissions', icon: ShieldCheckIcon, permission: 'users:view' },
        { id: 'analytics', name: 'Analytics Settings', icon: ChartBarIcon, permission: 'analytics:view' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue="My Company"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue="admin@mycompany.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Timezone</label>
                                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>UTC-8 (Pacific Time)</option>
                                        <option>UTC-5 (Eastern Time)</option>
                                        <option>UTC+0 (GMT)</option>
                                        <option>UTC+1 (Central European Time)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-xl font-medium text-white">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900">
                                        {user?.firstName} {user?.lastName}
                                    </h4>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                    <div className="mt-1">
                                        <RoleBadge role={user?.role} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Email notifications</h4>
                                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        defaultChecked
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Push notifications</h4>
                                        <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        defaultChecked
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Alert notifications</h4>
                                        <p className="text-sm text-gray-500">Get notified when alerts are triggered</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        defaultChecked
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Task assignments</h4>
                                        <p className="text-sm text-gray-500">Get notified when tasks are assigned to you</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        defaultChecked
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'users':
                return <UserRoleManager />;

            case 'permissions':
                return (
                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permission Overview</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Your Current Permissions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(user?.permissions || []).map(permission => (
                                            <span key={permission} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                {permission}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Role Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <RoleBadge role={user?.role} size="md" />
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Your role determines what actions you can perform in the system.
                                            Contact your administrator if you need additional permissions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'analytics':
                return (
                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Data Retention Period</label>
                                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>30 days</option>
                                        <option>90 days</option>
                                        <option>1 year</option>
                                        <option>2 years</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Refresh Interval</label>
                                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>Real-time</option>
                                        <option>1 minute</option>
                                        <option>5 minutes</option>
                                        <option>15 minutes</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Enable data export</h4>
                                        <p className="text-sm text-gray-500">Allow users to export analytics data</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        defaultChecked
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your application settings and preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <PermissionGate
                                key={tab.id}
                                permissions={tab.permission ? [tab.permission] : []}
                                fallback={!tab.permission ? (
                                    <button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === tab.id
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <tab.icon className="h-5 w-5 mr-3" />
                                        {tab.name}
                                    </button>
                                ) : null}
                            >
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <tab.icon className="h-5 w-5 mr-3" />
                                    {tab.name}
                                </button>
                            </PermissionGate>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default Settings;
