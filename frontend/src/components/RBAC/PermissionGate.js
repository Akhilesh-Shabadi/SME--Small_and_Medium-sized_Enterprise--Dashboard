import React from 'react';
import { useSelector } from 'react-redux';

const PermissionGate = ({
    children,
    permissions = [],
    roles = [],
    fallback = null,
    requireAll = false
}) => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return fallback;
    }

    // Check role-based access
    if (roles.length > 0) {
        const userRole = user.role || 'employee';
        if (!roles.includes(userRole)) {
            return fallback;
        }
    }

    // Check permission-based access
    if (permissions.length > 0) {
        const userPermissions = user.permissions || [];

        if (requireAll) {
            // User must have ALL permissions
            const hasAllPermissions = permissions.every(permission =>
                userPermissions.includes(permission)
            );
            if (!hasAllPermissions) {
                return fallback;
            }
        } else {
            // User must have ANY permission
            const hasAnyPermission = permissions.some(permission =>
                userPermissions.includes(permission)
            );
            if (!hasAnyPermission) {
                return fallback;
            }
        }
    }

    return children;
};

export default PermissionGate;
