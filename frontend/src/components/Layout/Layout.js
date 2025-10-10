import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { fetchNotifications } from '../../store/slices/alertSlice';

const Layout = () => {
    const dispatch = useDispatch();

    // Fetch notifications when the layout loads
    useEffect(() => {
        dispatch(fetchNotifications({ limit: 50 })); // Load last 50 notifications
    }, [dispatch]);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
