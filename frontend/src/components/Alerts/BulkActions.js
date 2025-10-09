import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    TrashIcon,
    CheckIcon,
    PlayIcon,
    PauseIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { alertService } from '../../services/alertService';
import { setLoading, setError } from '../../store/slices/alertSlice';

const BulkActions = ({ selectedAlerts, onSelectionChange, onBulkActionComplete }) => {
    const dispatch = useDispatch();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [actionType, setActionType] = useState('');

    const handleBulkAction = async (action) => {
        if (selectedAlerts.length === 0) return;

        setActionType(action);
        setShowConfirmDialog(true);
    };

    const confirmBulkAction = async () => {
        if (selectedAlerts.length === 0) return;

        try {
            setIsProcessing(true);
            dispatch(setLoading(true));

            const promises = selectedAlerts.map(alertId => {
                switch (actionType) {
                    case 'delete':
                        return alertService.deleteAlert(alertId);
                    case 'acknowledge':
                        return alertService.acknowledgeAlert(alertId);
                    case 'activate':
                        return alertService.updateAlert(alertId, { isActive: true });
                    case 'deactivate':
                        return alertService.updateAlert(alertId, { isActive: false });
                    default:
                        return Promise.resolve();
                }
            });

            await Promise.all(promises);

            onBulkActionComplete(actionType, selectedAlerts);
            onSelectionChange([]);
            setShowConfirmDialog(false);
        } catch (error) {
            dispatch(setError(`Failed to ${actionType} alerts`));
            console.error(`Error performing bulk ${actionType}:`, error);
        } finally {
            setIsProcessing(false);
            dispatch(setLoading(false));
        }
    };

    const getActionText = (action) => {
        switch (action) {
            case 'delete': return 'Delete';
            case 'acknowledge': return 'Acknowledge';
            case 'activate': return 'Activate';
            case 'deactivate': return 'Deactivate';
            default: return action;
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'delete': return <TrashIcon className="h-4 w-4" />;
            case 'acknowledge': return <CheckIcon className="h-4 w-4" />;
            case 'activate': return <PlayIcon className="h-4 w-4" />;
            case 'deactivate': return <PauseIcon className="h-4 w-4" />;
            default: return null;
        }
    };


    if (selectedAlerts.length === 0) return null;

    return (
        <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-800">
                            {selectedAlerts.length} alert{selectedAlerts.length !== 1 ? 's' : ''} selected
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleBulkAction('acknowledge')}
                            disabled={isProcessing}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
                        >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Acknowledge
                        </button>

                        <button
                            onClick={() => handleBulkAction('activate')}
                            disabled={isProcessing}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50"
                        >
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Activate
                        </button>

                        <button
                            onClick={() => handleBulkAction('deactivate')}
                            disabled={isProcessing}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50"
                        >
                            <PauseIcon className="h-4 w-4 mr-1" />
                            Deactivate
                        </button>

                        <button
                            onClick={() => handleBulkAction('delete')}
                            disabled={isProcessing}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                        >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                        </button>

                        <button
                            onClick={() => onSelectionChange([])}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowConfirmDialog(false)}></div>

                        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        {getActionIcon(actionType)}
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Confirm {getActionText(actionType)} Action
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to {actionType} {selectedAlerts.length} alert{selectedAlerts.length !== 1 ? 's' : ''}?
                                                {actionType === 'delete' && ' This action cannot be undone.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    onClick={confirmBulkAction}
                                    disabled={isProcessing}
                                    className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${actionType === 'delete'
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                        } disabled:opacity-50`}
                                >
                                    {isProcessing ? 'Processing...' : `Yes, ${getActionText(actionType).toLowerCase()}`}
                                </button>
                                <button
                                    onClick={() => setShowConfirmDialog(false)}
                                    disabled={isProcessing}
                                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BulkActions;
