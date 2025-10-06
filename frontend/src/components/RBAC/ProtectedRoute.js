import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../UI/LoadingSpinner';

const ProtectedRoute = ({
    children,
    requiredPermissions = [],
    requiredRoles = [],
    fallback = null,
    redirectTo = '/dashboard'
}) => {
    const { user, isLoading } = useSelector((state) => state.auth);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access
    if (requiredRoles.length > 0) {
        const userRole = user.role || 'employee';
        if (!requiredRoles.includes(userRole)) {
            return fallback || <Navigate to={redirectTo} replace />;
        }
    }

    // Check permission-based access
    if (requiredPermissions.length > 0) {
        const userPermissions = user.permissions || [];
        const hasRequiredPermissions = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );

        if (!hasRequiredPermissions) {
            return fallback || <Navigate to={redirectTo} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
