import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    HomeIcon,
    ChartBarIcon,
    UsersIcon,
    BellIcon,
    CogIcon,
    XMarkIcon,
    ServerIcon,
} from '@heroicons/react/24/outline';
import { toggleSidebar } from '../../store/slices/uiSlice';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { sidebarOpen } = useSelector((state) => state.ui);
    const { user } = useSelector((state) => state.auth);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Data Sources', href: '/data-sources', icon: ServerIcon },
        { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
        { name: 'Collaboration', href: '/collaboration', icon: UsersIcon },
        { name: 'Alerts', href: '/alerts', icon: BellIcon },
        { name: 'Settings', href: '/settings', icon: CogIcon },
    ];

    return (
        <>
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => dispatch(toggleSidebar())}
                >
                    <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
                </div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">SME Dashboard</h1>
                    <button
                        className="lg:hidden"
                        onClick={() => dispatch(toggleSidebar())}
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                <nav className="mt-6 px-3">
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                                onClick={() => {
                                    // Close mobile sidebar when navigating
                                    if (window.innerWidth < 1024) {
                                        dispatch(toggleSidebar());
                                    }
                                }}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 ${window.location.pathname === item.href
                                        ? 'text-blue-500'
                                        : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* User info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                    {user?.firstName?.charAt(0)}
                                </span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
