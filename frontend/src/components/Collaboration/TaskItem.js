import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import {
    PencilIcon,
    TrashIcon,
    ClockIcon,
    UserIcon,
    TagIcon
} from '@heroicons/react/24/outline';

const TaskItem = ({
    task,
    onUpdate,
    onDelete,
    isEditing,
    onEdit,
    onCancelEdit
}) => {
    const { user } = useSelector((state) => state.auth);
    const [editData, setEditData] = useState({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });

    const isOwner = task.createdBy === user.id;
    const isAssignee = task.assignedTo === user.id;
    const canEdit = isOwner || isAssignee;
    const canDelete = isOwner;

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleUpdate = () => {
        const updateData = {
            title: editData.title.trim(),
            description: editData.description.trim(),
            status: editData.status,
            priority: editData.priority,
            dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString() : null
        };

        if (updateData.title && updateData.title !== task.title) {
            onUpdate(task.id, updateData);
        } else {
            onCancelEdit();
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            onDelete(task.id);
        }
    };

    const handleStatusChange = (newStatus) => {
        onUpdate(task.id, { status: newStatus });
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Task title"
                        />
                    </div>

                    <div>
                        <textarea
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Task description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={editData.status}
                                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={editData.priority}
                                onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            value={editData.dueDate}
                            onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                            {task.description && (
                                <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <UserIcon className="h-3 w-3 mr-1" />
                                <span>Assigned to {task.assignee?.firstName} {task.assignee?.lastName}</span>
                            </div>

                            {task.dueDate && (
                                <div className="flex items-center">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            {canEdit && (
                                <button
                                    onClick={onEdit}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                            )}

                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="text-gray-400 hover:text-red-600"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                            <TagIcon className="h-3 w-3 text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                                {task.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick status change buttons */}
                    {isAssignee && task.status !== 'completed' && (
                        <div className="flex space-x-2">
                            {task.status === 'pending' && (
                                <button
                                    onClick={() => handleStatusChange('in_progress')}
                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                >
                                    Start
                                </button>
                            )}
                            {task.status === 'in_progress' && (
                                <button
                                    onClick={() => handleStatusChange('completed')}
                                    className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                                >
                                    Complete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskItem;
