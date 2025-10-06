import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboards } from '../../store/slices/dashboardSlice';
import { useSocket } from '../../contexts/SocketContext';
import DashboardCard from '../../components/Dashboard/DashboardCard';
import DashboardModal from '../../components/Dashboard/DashboardModal';
import EditDashboardModal from '../../components/Dashboard/EditDashboardModal';
import DashboardPermissionGate from '../../components/Dashboard/DashboardPermissionGate';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { dashboards, isLoading, error } = useSelector((state) => state.dashboard);
    const { joinDashboard } = useSocket();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDashboard, setEditingDashboard] = useState(null);

    useEffect(() => {
        dispatch(fetchDashboards());
    }, [dispatch]);

    const handleCreateDashboard = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleDashboardCreated = (dashboard) => {
        // Dashboard is automatically added to the list via Redux
        console.log('Dashboard created:', dashboard);
    };

    const handleEditDashboard = (dashboard) => {
        setEditingDashboard(dashboard);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingDashboard(null);
    };

    const handleDashboardUpdated = (dashboard) => {
        // Dashboard is automatically updated in the list via Redux
        console.log('Dashboard updated:', dashboard);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Error loading dashboards: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboards</h1>
                    <p className="text-gray-600">Manage your analytics dashboards</p>
                </div>
                <DashboardPermissionGate permission="dashboard:create">
                    <button
                        onClick={handleCreateDashboard}
                        className="btn btn-primary"
                    >
                        Create Dashboard
                    </button>
                </DashboardPermissionGate>
            </div>

            {dashboards.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No dashboards</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new dashboard.</p>
                    <div className="mt-6">
                        <DashboardPermissionGate permission="dashboard:create">
                            <button
                                onClick={handleCreateDashboard}
                                className="btn btn-primary"
                            >
                                Create Dashboard
                            </button>
                        </DashboardPermissionGate>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboards.map((dashboard) => (
                        <DashboardCard
                            key={dashboard.id}
                            dashboard={dashboard}
                            onJoin={() => joinDashboard(dashboard.id)}
                            onEdit={handleEditDashboard}
                        />
                    ))}
                </div>
            )}

            <DashboardModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleDashboardCreated}
            />

            <EditDashboardModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSuccess={handleDashboardUpdated}
                dashboard={editingDashboard}
            />
        </div>
    );
};

export default Dashboard;
