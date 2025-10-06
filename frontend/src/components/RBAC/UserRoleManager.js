import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    UserIcon,
    ShieldCheckIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import RoleBadge from './RoleBadge';
import PermissionGate from './PermissionGate';

const UserRoleManager = () => {
    const dispatch = useDispatch();
    const { users, isLoading } = useSelector((state) => state.auth);
    const { user: currentUser } = useSelector((state) => state.auth);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('employee');
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    // Mock users data for demonstration
    const mockUsers = [
        {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'admin',
            permissions: ['dashboard:view', 'dashboard:create', 'dashboard:edit', 'dashboard:delete'],
            lastLogin: new Date().toISOString(),
            isActive: true
        },
        {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            role: 'manager',
            permissions: ['dashboard:view', 'dashboard:create', 'dashboard:edit', 'analytics:view'],
            lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            isActive: true
        },
        {
            id: '3',
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob@example.com',
            role: 'employee',
            permissions: ['dashboard:view', 'analytics:view'],
            lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true
        }
    ];

    const [usersList, setUsersList] = useState(mockUsers);

    const roleOptions = [
        { value: 'admin', label: 'Admin', description: 'Full system access' },
        { value: 'manager', label: 'Manager', description: 'Management and analytics access' },
        { value: 'employee', label: 'Employee', description: 'Basic dashboard access' }
    ];

    const permissionOptions = [
        {
            category: 'Dashboard', permissions: [
                { value: 'dashboard:view', label: 'View Dashboards' },
                { value: 'dashboard:create', label: 'Create Dashboards' },
                { value: 'dashboard:edit', label: 'Edit Dashboards' },
                { value: 'dashboard:delete', label: 'Delete Dashboards' }
            ]
        },
        {
            category: 'Analytics', permissions: [
                { value: 'analytics:view', label: 'View Analytics' },
                { value: 'analytics:export', label: 'Export Analytics' }
            ]
        },
        {
            category: 'Collaboration', permissions: [
                { value: 'comments:view', label: 'View Comments' },
                { value: 'comments:create', label: 'Create Comments' },
                { value: 'comments:edit', label: 'Edit Comments' },
                { value: 'tasks:view', label: 'View Tasks' },
                { value: 'tasks:create', label: 'Create Tasks' },
                { value: 'tasks:assign', label: 'Assign Tasks' }
            ]
        },
        {
            category: 'Alerts', permissions: [
                { value: 'alerts:view', label: 'View Alerts' },
                { value: 'alerts:create', label: 'Create Alerts' },
                { value: 'alerts:edit', label: 'Edit Alerts' },
                { value: 'alerts:acknowledge', label: 'Acknowledge Alerts' }
            ]
        }
    ];

    const handleEditUser = (user) => {
        setEditingUser(user);
        setSelectedRole(user.role);
        setSelectedPermissions([...user.permissions]);
    };

    const handleSaveUser = () => {
        if (!editingUser) return;

        setUsersList(prevUsers =>
            prevUsers.map(user =>
                user.id === editingUser.id
                    ? {
                        ...user,
                        role: selectedRole,
                        permissions: selectedPermissions
                    }
                    : user
            )
        );

        setEditingUser(null);
        setSelectedRole('employee');
        setSelectedPermissions([]);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setSelectedRole('employee');
        setSelectedPermissions([]);
    };

    const handlePermissionToggle = (permission) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleRoleChange = (role) => {
        setSelectedRole(role);

        // Auto-assign permissions based on role
        const rolePermissions = {
            admin: permissionOptions.flatMap(category =>
                category.permissions.map(p => p.value)
            ),
            manager: [
                'dashboard:view', 'dashboard:create', 'dashboard:edit',
                'analytics:view', 'analytics:export',
                'comments:view', 'comments:create', 'comments:edit',
                'tasks:view', 'tasks:create', 'tasks:assign',
                'alerts:view', 'alerts:create', 'alerts:edit', 'alerts:acknowledge'
            ],
            employee: [
                'dashboard:view', 'analytics:view',
                'comments:view', 'comments:create',
                'tasks:view', 'alerts:view', 'alerts:acknowledge'
            ]
        };

        setSelectedPermissions(rolePermissions[role] || []);
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">User Role Management</h2>
                <PermissionGate permissions={['users:create']}>
                    <button className="btn btn-primary">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Add User
                    </button>
                </PermissionGate>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Permissions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usersList.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                <span className="text-sm font-medium text-white">
                                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {user.permissions.length} permissions
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.lastLogin).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <PermissionGate permissions={['users:edit']}>
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                        </PermissionGate>
                                        <PermissionGate permissions={['users:delete']}>
                                            <button className="text-red-600 hover:text-red-900">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </PermissionGate>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Edit User: {editingUser.firstName} {editingUser.lastName}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {roleOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label} - {option.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {permissionOptions.map(category => (
                                            <div key={category.category}>
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">{category.category}</h4>
                                                <div className="space-y-1 ml-4">
                                                    {category.permissions.map(permission => (
                                                        <label key={permission.value} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPermissions.includes(permission.value)}
                                                                onChange={() => handlePermissionToggle(permission.value)}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveUser}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserRoleManager;
