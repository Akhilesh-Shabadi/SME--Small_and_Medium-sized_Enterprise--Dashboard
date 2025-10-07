import React from 'react';
import { useSelector } from 'react-redux';

const DashboardPermissionGate = ({
    children,
    permission,
    fallback = null,
    requireOwnership = false,
    dashboard = null
}) => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return fallback;
    }

    const hasPermission = user.permissions?.includes(permission) || false;

    let isOwner = true;
    if (requireOwnership) {
        if (!dashboard || !dashboard.createdBy) {
            isOwner = false;
        } else {
            isOwner = dashboard.createdBy === user.id;
        }
    }

    if (!hasPermission || !isOwner) {
        return fallback;
    }

    return children;
};

export default DashboardPermissionGate;
