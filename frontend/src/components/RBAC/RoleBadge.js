import React from 'react';

const RoleBadge = ({ role, size = 'sm' }) => {
    const getRoleConfig = (role) => {
        // Handle both string and object role formats
        const roleName = typeof role === 'string' ? role : role?.name || role?.roleName || 'unknown';
        switch (roleName?.toLowerCase()) {
            case 'admin':
                return {
                    label: 'Admin',
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: '👑'
                };
            case 'manager':
                return {
                    label: 'Manager',
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: '👔'
                };
            case 'employee':
                return {
                    label: 'Employee',
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: '👤'
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: '❓'
                };
        }
    };

    const config = getRoleConfig(role);
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
        >
            <span className="mr-1">{config.icon}</span>
            {config.label}
        </span>
    );
};

export default RoleBadge;
