import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { duplicateDashboard, deleteDashboard } from '../../store/slices/dashboardSlice';
import DashboardPermissionGate from './DashboardPermissionGate';
import { EyeIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DashboardCard = ({ dashboard, onJoin, onEdit }) => {
    const dispatch = useDispatch();

    // Early return if dashboard is not loaded
    if (!dashboard) {
        return null;
    }

    const handleJoin = () => {
        if (onJoin) {
            onJoin();
        }
    };

    const handleDuplicate = async () => {
        try {
            await dispatch(duplicateDashboard(dashboard.id)).unwrap();
            toast.success('Dashboard duplicated successfully!');
        } catch (error) {
            console.error('Error duplicating dashboard:', error);
            toast.error('Failed to duplicate dashboard');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this dashboard? This action cannot be undone.')) {
            try {
                await dispatch(deleteDashboard(dashboard.id)).unwrap();
                toast.success('Dashboard deleted successfully!');
            } catch (error) {
                console.error('Error deleting dashboard:', error);
                toast.error('Failed to delete dashboard');
            }
        }
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit(dashboard);
        }
    };

    return (
        <div className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {dashboard.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                        {dashboard.description || 'No description'}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                        <span>Created by {dashboard.creator?.firstName} {dashboard.creator?.lastName}</span>
                        <span className="mx-2">•</span>
                        <span>{dashboard.widgets?.length || 0} widgets</span>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    {dashboard.isPublic && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Public
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <Link
                        to={`/dashboard/${dashboard.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="View Dashboard"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>

                    <DashboardPermissionGate
                        permission="dashboard:edit"
                        requireOwnership={true}
                        dashboard={dashboard}
                    >
                        <button
                            onClick={handleEdit}
                            className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                            title="Edit Dashboard"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                    </DashboardPermissionGate>

                    <DashboardPermissionGate permission="dashboard:create">
                        <button
                            onClick={handleDuplicate}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Duplicate Dashboard"
                        >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                    </DashboardPermissionGate>

                    <DashboardPermissionGate
                        permission="dashboard:delete"
                        requireOwnership={true}
                        dashboard={dashboard}
                    >
                        <button
                            onClick={handleDelete}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Dashboard"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </DashboardPermissionGate>
                </div>
                <button
                    onClick={handleJoin}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    Join
                </button>
            </div>
        </div>
    );
};

export default DashboardCard;
