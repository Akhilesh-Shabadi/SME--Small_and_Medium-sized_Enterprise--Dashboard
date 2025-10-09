import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import {
    BellIcon,
    CheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ExclamationCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../../store/slices/alertSlice';

const NotificationCenter = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { notifications, unreadCount } = useSelector((state) => state.alert);
    const [filter, setFilter] = useState('all'); // all, unread, read

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return <XCircleIcon className="h-5 w-5 text-red-500" />;
            case 'high': return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
            case 'medium': return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
            case 'low': return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
            default: return <BellIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-50 border-red-200';
            case 'high': return 'bg-orange-50 border-orange-200';
            case 'medium': return 'bg-yellow-50 border-yellow-200';
            case 'low': return 'bg-blue-50 border-blue-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'read') return notification.isRead;
        return true;
    });

    const handleMarkAsRead = (notificationId) => {
        dispatch(markNotificationAsRead(notificationId));
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllNotificationsAsRead());
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }

        // Navigate to the action URL if available
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose}></div>

            <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <BellIcon className="h-6 w-6 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Filter and Actions */}
                <div className="border-b border-gray-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 text-sm rounded-full ${filter === 'all'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-3 py-1 text-sm rounded-full ${filter === 'unread'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Unread
                            </button>
                            <button
                                onClick={() => setFilter('read')}
                                className={`px-3 py-1 text-sm rounded-full ${filter === 'read'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Read
                            </button>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <BellIcon className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">No notifications</p>
                            <p className="text-sm">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            {getSeverityIcon(notification.metadata?.severity || 'medium')}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                </span>

                                                {notification.metadata?.severity && (
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(notification.metadata.severity)
                                                        }`}>
                                                        {notification.metadata.severity.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {!notification.isRead && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notification.id);
                                                }}
                                                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
