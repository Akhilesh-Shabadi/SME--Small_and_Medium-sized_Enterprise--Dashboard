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

    // Check if user has the required permission
    const hasPermission = user.permissions?.includes(permission) || false;

    // Check ownership if required
    // If requireOwnership is true, we need to check if the user owns the dashboard
    // If requireOwnership is false, we don't need to check ownership
    let isOwner = true;
    if (requireOwnership) {
        if (!dashboard || !dashboard.createdBy) {
            // If dashboard is not loaded or doesn't have createdBy, deny access
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
