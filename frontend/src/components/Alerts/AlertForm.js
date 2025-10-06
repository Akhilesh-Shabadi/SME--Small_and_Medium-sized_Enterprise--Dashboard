import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const AlertForm = ({ onSubmit, onCancel }) => {
    const [conditionData, setConditionData] = useState({
        metric: '',
        operator: 'greater_than',
        value: '',
        timeWindow: '1h'
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm();

    const alertType = watch('type', 'threshold');

    const handleFormSubmit = (data) => {
        const condition = {
            ...conditionData,
            metric: data.metric,
            operator: data.operator,
            value: parseFloat(data.value),
            timeWindow: data.timeWindow
        };

        onSubmit({
            dataSourceId: data.dataSourceId,
            type: data.type,
            title: data.title,
            message: data.message,
            severity: data.severity,
            condition
        });
        reset();
        setConditionData({
            metric: '',
            operator: 'greater_than',
            value: '',
            timeWindow: '1h'
        });
    };

    const handleCancel = () => {
        reset();
        setConditionData({
            metric: '',
            operator: 'greater_than',
            value: '',
            timeWindow: '1h'
        });
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">Alert Title</label>
                    <input
                        {...register('title', {
                            required: 'Alert title is required',
                            minLength: {
                                value: 2,
                                message: 'Title must be at least 2 characters'
                            },
                            maxLength: {
                                value: 200,
                                message: 'Title must be less than 200 characters'
                            }
                        })}
                        type="text"
                        className="input"
                        placeholder="Enter alert title"
                    />
                    {errors.title && (
                        <p className="error-message">{errors.title.message}</p>
                    )}
                </div>

                <div>
                    <label className="label">Severity</label>
                    <select
                        {...register('severity')}
                        className="input"
                        defaultValue="medium"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="label">Alert Message</label>
                <textarea
                    {...register('message', {
                        required: 'Alert message is required',
                        minLength: {
                            value: 1,
                            message: 'Message must be at least 1 character'
                        },
                        maxLength: {
                            value: 1000,
                            message: 'Message must be less than 1000 characters'
                        }
                    })}
                    className="input"
                    rows={3}
                    placeholder="Enter alert message"
                />
                {errors.message && (
                    <p className="error-message">{errors.message.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">Data Source</label>
                    <select
                        {...register('dataSourceId', {
                            required: 'Please select a data source'
                        })}
                        className="input"
                    >
                        <option value="">Select data source</option>
                        {/* In a real app, this would be populated from API */}
                        <option value="sales-ds">Sales Data</option>
                        <option value="inventory-ds">Inventory Data</option>
                        <option value="feedback-ds">Customer Feedback</option>
                    </select>
                    {errors.dataSourceId && (
                        <p className="error-message">{errors.dataSourceId.message}</p>
                    )}
                </div>

                <div>
                    <label className="label">Alert Type</label>
                    <select
                        {...register('type')}
                        className="input"
                        defaultValue="threshold"
                    >
                        <option value="threshold">Threshold</option>
                        <option value="anomaly">Anomaly Detection</option>
                        <option value="system">System Alert</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
            </div>

            {/* Condition configuration based on alert type */}
            {alertType === 'threshold' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900">Alert Condition</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="label">Metric</label>
                            <select
                                {...register('metric', {
                                    required: 'Please select a metric'
                                })}
                                className="input"
                            >
                                <option value="">Select metric</option>
                                <option value="inventory_level">Inventory Level</option>
                                <option value="sales_amount">Sales Amount</option>
                                <option value="customer_rating">Customer Rating</option>
                                <option value="low_stock_count">Low Stock Count</option>
                            </select>
                            {errors.metric && (
                                <p className="error-message">{errors.metric.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Operator</label>
                            <select
                                {...register('operator')}
                                className="input"
                                defaultValue="greater_than"
                            >
                                <option value="greater_than">Greater Than</option>
                                <option value="greater_than_or_equal">Greater Than or Equal</option>
                                <option value="less_than">Less Than</option>
                                <option value="less_than_or_equal">Less Than or Equal</option>
                                <option value="equals">Equals</option>
                                <option value="not_equals">Not Equals</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Value</label>
                            <input
                                {...register('value', {
                                    required: 'Value is required',
                                    valueAsNumber: true
                                })}
                                type="number"
                                step="0.01"
                                className="input"
                                placeholder="Enter threshold value"
                            />
                            {errors.value && (
                                <p className="error-message">{errors.value.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="label">Time Window</label>
                        <select
                            {...register('timeWindow')}
                            className="input"
                            defaultValue="1h"
                        >
                            <option value="5m">5 minutes</option>
                            <option value="15m">15 minutes</option>
                            <option value="1h">1 hour</option>
                            <option value="4h">4 hours</option>
                            <option value="1d">1 day</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-outline"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    Create Alert
                </button>
            </div>
        </form>
    );
};

export default AlertForm;
