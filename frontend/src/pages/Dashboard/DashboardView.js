import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard, setCurrentDashboard } from '../../store/slices/dashboardSlice';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import WidgetManager from '../../components/Dashboard/WidgetManager';
import { ArrowLeftIcon, PencilIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const DashboardView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentDashboard, isLoading, error } = useSelector((state) => state.dashboard);
    const { joinDashboard, leaveDashboard } = useSocket();
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchDashboard(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (currentDashboard) {
            joinDashboard(currentDashboard.id);
            return () => {
                leaveDashboard(currentDashboard.id);
            };
        }
    }, [currentDashboard, joinDashboard, leaveDashboard]);

    const handleBack = () => {
        navigate('/dashboard');
    };

    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleSettings = () => {
        // TODO: Implement dashboard settings
        console.log('Dashboard settings');
    };

    const handleAddWidget = () => {
        // WidgetManager handles this internally
        console.log('Add widget triggered');
    };

    const handleEditWidget = (widget) => {
        // WidgetManager handles this internally
        console.log('Edit widget triggered:', widget);
    };

    const handleDeleteWidget = (widget) => {
        // WidgetManager handles this internally
        console.log('Delete widget triggered:', widget);
    };

    const handleConfigureWidget = (widget) => {
        // WidgetManager handles this internally
        console.log('Configure widget triggered:', widget);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Error loading dashboard: {error}</p>
                <button
                    onClick={handleBack}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Back to Dashboards
                </button>
            </div>
        );
    }

    if (!currentDashboard) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Dashboard not found</p>
                <button
                    onClick={handleBack}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Back to Dashboards
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleBack}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Back to Dashboards"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {currentDashboard.name}
                        </h1>
                        <p className="text-gray-600">
                            {currentDashboard.description || 'No description'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {currentDashboard.isPublic && (
                        <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                            Public
                        </span>
                    )}
                    <button
                        onClick={handleEdit}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                        title="Edit Dashboard"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleSettings}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                        title="Dashboard Settings"
                    >
                        <Cog6ToothIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Widget Management */}
            <WidgetManager
                dashboard={currentDashboard}
                onAddWidget={handleAddWidget}
                onEditWidget={handleEditWidget}
                onDeleteWidget={handleDeleteWidget}
                onConfigureWidget={handleConfigureWidget}
            />

            {/* Dashboard Info */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-700">Created by:</span>
                        <span className="ml-2 text-gray-600">
                            {currentDashboard.creator?.firstName} {currentDashboard.creator?.lastName}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Widgets:</span>
                        <span className="ml-2 text-gray-600">
                            {currentDashboard.widgets?.length || 0}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <span className="ml-2 text-gray-600">
                            {new Date(currentDashboard.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
