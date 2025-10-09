import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    ArrowDownTrayIcon,
    DocumentArrowDownIcon,
    TableCellsIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { setLoading, setError } from '../../store/slices/alertSlice';

const ExportAlerts = ({ isOpen, onClose, selectedAlerts = [] }) => {
    const dispatch = useDispatch();
    const { alerts } = useSelector((state) => state.alert);
    const [exportFormat, setExportFormat] = useState('csv');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            dispatch(setLoading(true));

            const alertsToExport = selectedAlerts.length > 0
                ? alerts.filter(alert => selectedAlerts.includes(alert.id))
                : alerts;

            if (exportFormat === 'csv') {
                exportToCSV(alertsToExport);
            } else if (exportFormat === 'json') {
                exportToJSON(alertsToExport);
            }

            onClose();
        } catch (error) {
            dispatch(setError('Failed to export alerts'));
            console.error('Error exporting alerts:', error);
        } finally {
            setIsExporting(false);
            dispatch(setLoading(false));
        }
    };

    const exportToCSV = (alertsData) => {
        const headers = [
            'ID',
            'Title',
            'Message',
            'Type',
            'Severity',
            'Status',
            'Active',
            'Triggered',
            'Acknowledged',
            'Created At',
            'Triggered At',
            'Acknowledged At',
            'Created By'
        ];

        const csvContent = [
            headers.join(','),
            ...alertsData.map(alert => [
                alert.id,
                `"${alert.title.replace(/"/g, '""')}"`,
                `"${alert.message.replace(/"/g, '""')}"`,
                alert.type,
                alert.severity,
                alert.isTriggered ? 'Triggered' : 'Not Triggered',
                alert.isActive ? 'Yes' : 'No',
                alert.isTriggered ? 'Yes' : 'No',
                alert.acknowledgedAt ? 'Yes' : 'No',
                new Date(alert.timestamp).toISOString(),
                alert.triggeredAt ? new Date(alert.triggeredAt).toISOString() : '',
                alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toISOString() : '',
                alert.user ? `${alert.user.firstName} ${alert.user.lastName}` : ''
            ].join(','))
        ].join('\n');

        downloadFile(csvContent, 'alerts.csv', 'text/csv');
    };

    const exportToJSON = (alertsData) => {
        const jsonContent = JSON.stringify(alertsData, null, 2);
        downloadFile(jsonContent, 'alerts.json', 'application/json');
    };

    const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <ArrowDownTrayIcon className="h-6 w-6 text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900">Export Alerts</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">
                                    {selectedAlerts.length > 0
                                        ? `Export ${selectedAlerts.length} selected alert${selectedAlerts.length !== 1 ? 's' : ''}`
                                        : `Export all ${alerts.length} alert${alerts.length !== 1 ? 's' : ''}`
                                    }
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Export Format
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="csv"
                                            checked={exportFormat === 'csv'}
                                            onChange={(e) => setExportFormat(e.target.value)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div className="ml-3 flex items-center">
                                            <TableCellsIcon className="h-5 w-5 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-700">CSV (Excel compatible)</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="json"
                                            checked={exportFormat === 'json'}
                                            onChange={(e) => setExportFormat(e.target.value)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div className="ml-3 flex items-center">
                                            <DocumentArrowDownIcon className="h-5 w-5 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-700">JSON (Structured data)</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> The export will include all alert details including title, message,
                                    severity, status, timestamps, and metadata.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            {isExporting ? 'Exporting...' : 'Export Alerts'}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isExporting}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportAlerts;
