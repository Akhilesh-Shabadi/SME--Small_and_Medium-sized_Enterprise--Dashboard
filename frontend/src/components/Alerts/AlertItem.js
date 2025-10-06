import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    PencilIcon,
    TrashIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ExclamationCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const AlertItem = ({
    alert,
    onUpdate,
    onDelete,
    onAcknowledge,
    isEditing,
    onEdit,
    onCancelEdit
}) => {
    const [editData, setEditData] = useState({
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        isActive: alert.isActive
    });

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return <XCircleIcon className="h-5 w-5 text-red-500" />;
            case 'high': return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
            case 'medium': return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
            case 'low': return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
            default: return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleUpdate = () => {
        const updateData = {
            title: editData.title.trim(),
            message: editData.message.trim(),
            severity: editData.severity,
            isActive: editData.isActive
        };

        if (updateData.title && updateData.title !== alert.title) {
            onUpdate(alert.id, updateData);
        } else {
            onCancelEdit();
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this alert?')) {
            onDelete(alert.id);
        }
    };

    const handleAcknowledge = () => {
        onAcknowledge(alert.id);
    };

    return (
        <div className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Alert title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                            value={editData.message}
                            onChange={(e) => setEditData({ ...editData, message: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Alert message"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                            <select
                                value={editData.severity}
                                onChange={(e) => setEditData({ ...editData, severity: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={editData.isActive}
                                onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                Active
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={onCancelEdit}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdate}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            {getSeverityIcon(alert.severity)}
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                                <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                                {alert.severity.toUpperCase()}
                            </span>
                            {alert.isTriggered && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                    TRIGGERED
                                </span>
                            )}
                            {alert.acknowledgedAt && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    ACKNOWLEDGED
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                            <span>Type: {alert.type}</span>
                            <span>Created: {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
                            {alert.triggeredAt && (
                                <span>Triggered: {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })}</span>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={onEdit}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>

                            <button
                                onClick={handleDelete}
                                className="text-gray-400 hover:text-red-600"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2">
                        {alert.isTriggered && !alert.acknowledgedAt && (
                            <button
                                onClick={handleAcknowledge}
                                className="inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                            >
                                <CheckIcon className="h-3 w-3 mr-1" />
                                Acknowledge
                            </button>
                        )}

                        {!alert.isActive && (
                            <button
                                onClick={() => onUpdate(alert.id, { isActive: true })}
                                className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                            >
                                Activate
                            </button>
                        )}

                        {alert.isActive && (
                            <button
                                onClick={() => onUpdate(alert.id, { isActive: false })}
                                className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                            >
                                Deactivate
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertItem;
