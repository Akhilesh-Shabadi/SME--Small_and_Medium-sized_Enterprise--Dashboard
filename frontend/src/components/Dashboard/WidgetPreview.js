import React from 'react';

const WidgetPreview = ({ widget }) => {
    if (!widget) return null;

    const renderPreview = () => {
        switch (widget.type) {
            case 'chart':
                return (
                    <div className="h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-1">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                                    <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2V11z" />
                                </svg>
                            </div>
                            <p className="text-xs text-blue-700 font-medium">Chart</p>
                        </div>
                    </div>
                );

            case 'table':
                return (
                    <div className="h-20 bg-gradient-to-r from-green-100 to-green-200 rounded flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-1">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                                    <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
                                </svg>
                            </div>
                            <p className="text-xs text-green-700 font-medium">Table</p>
                        </div>
                    </div>
                );

            case 'metric':
                return (
                    <div className="h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-1">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="text-purple-600">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                            <p className="text-xs text-purple-700 font-medium">Metric</p>
                        </div>
                    </div>
                );

            case 'gauge':
                return (
                    <div className="h-20 bg-gradient-to-r from-orange-100 to-orange-200 rounded flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-1">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="text-orange-600">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <p className="text-xs text-orange-700 font-medium">Gauge</p>
                        </div>
                    </div>
                );

            case 'map':
                return (
                    <div className="h-20 bg-gradient-to-r from-red-100 to-red-200 rounded flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-1">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="text-red-600">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                            </div>
                            <p className="text-xs text-red-700 font-medium">Map</p>
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-1">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
                                    <path d="M5 4v3h5.5v12h3V7H19V4H5z" />
                                </svg>
                            </div>
                            <p className="text-xs text-gray-700 font-medium">Text</p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="h-20 bg-gray-100 rounded flex items-center justify-center">
                        <p className="text-sm text-gray-500">Unknown Type</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full">
            {renderPreview()}
        </div>
    );
};

export default WidgetPreview;
