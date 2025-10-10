import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Bars3Icon,
    BellIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { useSocket } from '../../contexts/SocketContext';
import NotificationCenter from '../Alerts/NotificationCenter';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { unreadCount } = useSelector((state) => state.alert);
    const { isConnected } = useSocket();
    const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleNotificationClick = () => {
        setIsNotificationCenterOpen(true);
    };

    const handleCloseNotificationCenter = () => {
        setIsNotificationCenterOpen(false);
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center">
                    <button
                        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        onClick={() => dispatch(toggleSidebar())}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    <div className="ml-4 flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-sm text-gray-500">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button
                        onClick={handleNotificationClick}
                        className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                    >
                        <BellIcon className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* User menu */}
                    <div className="relative group">
                        <button className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                            <span className="hidden md:block text-sm font-medium">
                                {user?.firstName} {user?.lastName}
                            </span>
                        </button>

                        {/* Dropdown menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Center */}
            <NotificationCenter
                isOpen={isNotificationCenterOpen}
                onClose={handleCloseNotificationCenter}
            />
        </header>
    );
};

export default Header;
