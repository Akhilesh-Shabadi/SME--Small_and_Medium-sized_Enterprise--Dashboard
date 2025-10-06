import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CommentSection from '../../components/Collaboration/CommentSection';
import TaskManager from '../../components/Collaboration/TaskManager';
import { fetchDashboards } from '../../store/slices/dashboardSlice';

const Collaboration = () => {
    const dispatch = useDispatch();
    const { dashboards, currentDashboard } = useSelector((state) => state.dashboard);
    const { comments, tasks } = useSelector((state) => state.collaboration);

    useEffect(() => {
        if (dashboards.length === 0) {
            dispatch(fetchDashboards());
        }
    }, [dispatch, dashboards.length]);

    // Get a sample widget for demonstration
    const sampleWidget = currentDashboard?.widgets?.[0] || { id: 'sample-widget', title: 'Sample Widget' };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Collaboration</h1>
                <p className="text-gray-600">Team collaboration and task management</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <CommentSection widgetId={sampleWidget.id} />
                </div>

                <div className="card">
                    <TaskManager
                        widgetId={sampleWidget.id}
                        dashboardId={currentDashboard?.id || 'sample-dashboard'}
                    />
                </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">J</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">John Doe commented on Sales Chart</p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                        <span className="text-xs text-blue-600">Comment</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">J</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Jane Smith completed task "Update Inventory"</p>
                                <p className="text-xs text-gray-500">4 hours ago</p>
                            </div>
                        </div>
                        <span className="text-xs text-green-600">Task</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">B</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Bob Johnson assigned you a new task</p>
                                <p className="text-xs text-gray-500">6 hours ago</p>
                            </div>
                        </div>
                        <span className="text-xs text-yellow-600">Assignment</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Collaboration;
