import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../../contexts/SocketContext';
import { addTask, updateTask, removeTask } from '../../store/slices/collaborationSlice';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import TaskFilter from './TaskFilter';
import LoadingSpinner from '../UI/LoadingSpinner';

const TaskManager = ({ widgetId, dashboardId }) => {
    const dispatch = useDispatch();
    const { tasks, isLoading } = useSelector((state) => state.collaboration);
    const { user } = useSelector((state) => state.auth);
    const { createTask, updateTask: updateTaskSocket } = useSocket();
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        assignedTo: 'all'
    });

    // Filter tasks for this widget
    const widgetTasks = tasks.filter(task => task.widgetId === widgetId);

    // Apply additional filters
    const filteredTasks = widgetTasks.filter(task => {
        if (filters.status !== 'all' && task.status !== filters.status) return false;
        if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
        if (filters.assignedTo !== 'all' && task.assignedTo !== filters.assignedTo) return false;
        return true;
    });

    const handleCreateTask = async (taskData) => {
        try {
            const newTask = {
                id: Date.now().toString(), // Temporary ID
                title: taskData.title,
                description: taskData.description,
                widgetId,
                dashboardId,
                createdBy: user.id,
                assignedTo: taskData.assignedTo,
                priority: taskData.priority || 'medium',
                dueDate: taskData.dueDate,
                tags: taskData.tags || [],
                metadata: taskData.metadata || {},
                status: 'pending',
                createdByUser: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar
                },
                assignee: {
                    id: taskData.assignedTo,
                    firstName: 'Loading...', // Will be updated when real data comes
                    lastName: '',
                    email: '',
                    avatar: null
                },
                timestamp: new Date().toISOString()
            };

            // Add to Redux store immediately for optimistic update
            dispatch(addTask(newTask));

            // Send to socket for real-time updates
            createTask(newTask);

            setShowForm(false);
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const handleUpdateTask = async (taskId, updateData) => {
        try {
            // Update in Redux store
            dispatch(updateTask({ id: taskId, ...updateData }));

            // Send to socket for real-time updates
            updateTaskSocket({
                dashboardId,
                taskId,
                ...updateData
            });

            setEditingTask(null);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            // Remove from Redux store
            dispatch(removeTask(taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const getTaskCounts = () => {
        return {
            total: widgetTasks.length,
            pending: widgetTasks.filter(t => t.status === 'pending').length,
            inProgress: widgetTasks.filter(t => t.status === 'in_progress').length,
            completed: widgetTasks.filter(t => t.status === 'completed').length
        };
    };

    const counts = getTaskCounts();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Tasks ({counts.total})
                    </h3>
                    <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                        <span>Pending: {counts.pending}</span>
                        <span>In Progress: {counts.inProgress}</span>
                        <span>Completed: {counts.completed}</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary text-sm"
                >
                    {showForm ? 'Cancel' : 'Add Task'}
                </button>
            </div>

            <TaskFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                tasks={widgetTasks}
            />

            {showForm && (
                <TaskForm
                    onSubmit={handleCreateTask}
                    onCancel={() => setShowForm(false)}
                    widgetId={widgetId}
                    dashboardId={dashboardId}
                />
            )}

            <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No tasks found.</p>
                        {widgetTasks.length === 0 && (
                            <p className="mt-1">Create your first task to get started!</p>
                        )}
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onUpdate={handleUpdateTask}
                            onDelete={handleDeleteTask}
                            isEditing={editingTask === task.id}
                            onEdit={() => setEditingTask(task.id)}
                            onCancelEdit={() => setEditingTask(null)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskManager;
