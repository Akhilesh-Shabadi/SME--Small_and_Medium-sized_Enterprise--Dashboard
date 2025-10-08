import React, { useState, useMemo } from 'react';
import ChartContainer from './ChartContainer';
import { StarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const CustomerFeedbackChart = ({ data = [], onDrillDown, timeRange = '7d' }) => {
    const [drillDownData, setDrillDownData] = useState(null);
    const [isDrilledDown, setIsDrilledDown] = useState(false);
    const [drillDownTitle, setDrillDownTitle] = useState('');

    // Process feedback data
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            // Generate sample feedback data
            return [
                { name: '5 Stars', value: 45, rating: 5, sentiment: 'positive' },
                { name: '4 Stars', value: 30, rating: 4, sentiment: 'positive' },
                { name: '3 Stars', value: 15, rating: 3, sentiment: 'neutral' },
                { name: '2 Stars', value: 7, rating: 2, sentiment: 'negative' },
                { name: '1 Star', value: 3, rating: 1, sentiment: 'negative' }
            ];
        }
        return data;
    }, [data]);

    const handleDrillDown = (clickedData) => {
        if (!onDrillDown) return;

        // Simulate drill-down data for detailed feedback
        const drillDown = generateDetailedFeedback(clickedData);

        setDrillDownData(drillDown);
        setIsDrilledDown(true);
        setDrillDownTitle(`${clickedData.name} - Detailed Feedback`);
    };

    const handleBack = () => {
        setDrillDownData(null);
        setIsDrilledDown(false);
        setDrillDownTitle('');
    };

    const generateDetailedFeedback = (ratingData) => {
        // Simulate detailed feedback for the selected rating
        const feedbacks = [
            "Great product, highly recommend!",
            "Good quality, fast delivery",
            "Satisfied with the purchase",
            "Could be better",
            "Not what I expected",
            "Excellent customer service",
            "Product arrived damaged",
            "Love it, will buy again",
            "Average quality",
            "Poor packaging"
        ];

        return Array.from({ length: ratingData.value }, (_, i) => ({
            name: `Feedback ${i + 1}`,
            value: Math.floor(Math.random() * 10) + 1,
            comment: feedbacks[Math.floor(Math.random() * feedbacks.length)],
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            customer: `Customer ${i + 1}`,
            rating: ratingData.rating
        }));
    };

    const feedbackStats = useMemo(() => {
        const totalResponses = Number(chartData.reduce((sum, item) => sum + (item.value || 0), 0));

        // Handle edge cases where totalResponses is 0 or data is invalid
        if (totalResponses === 0 || !chartData || chartData.length === 0) {
            return {
                totalResponses: 0,
                averageRating: 0,
                positivePercentage: 0,
                negativePercentage: 0
            };
        }

        const weightedSum = chartData.reduce((sum, item) => {
            const rating = Number(item.rating) || 0;
            const value = Number(item.value) || 0;
            return sum + (rating * value);
        }, 0);

        const averageRating = weightedSum / totalResponses;

        const positiveCount = chartData
            .filter(item => item.sentiment === 'positive')
            .reduce((sum, item) => sum + (Number(item.value) || 0), 0);
        const positivePercentage = (positiveCount / totalResponses) * 100;

        const negativeCount = chartData
            .filter(item => item.sentiment === 'negative')
            .reduce((sum, item) => sum + (Number(item.value) || 0), 0);
        const negativePercentage = (negativeCount / totalResponses) * 100;

        return {
            totalResponses,
            averageRating: Math.round(averageRating * 10) / 10,
            positivePercentage: Math.round(positivePercentage),
            negativePercentage: Math.round(negativePercentage)
        };
    }, [chartData]);

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600 bg-green-100';
            case 'negative': return 'text-red-600 bg-red-100';
            case 'neutral': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <StarIcon
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
            />
        ));
    };

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <StarIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Average Rating</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {feedbackStats.averageRating > 0 ? feedbackStats.averageRating : 'No data'}
                            </p>
                            <div className="flex">
                                {feedbackStats.averageRating > 0 ? renderStars(Math.floor(feedbackStats.averageRating)) : (
                                    <span className="text-sm text-gray-500">No ratings available</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                            <p className="text-2xl font-semibold text-gray-900">{feedbackStats.totalResponses}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Positive</p>
                            <p className="text-2xl font-semibold text-green-600">{feedbackStats.positivePercentage}%</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h.01M15 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Negative</p>
                            <p className="text-2xl font-semibold text-red-600">{feedbackStats.negativePercentage}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pie Chart for Rating Distribution */}
            <ChartContainer
                title={isDrilledDown ? drillDownTitle : "Rating Distribution"}
                data={chartData}
                type="pie"
                height={400}
                onDrillDown={handleDrillDown}
                drillDownData={drillDownData}
                isDrilledDown={isDrilledDown}
                onBack={handleBack}
                config={{
                    showLegend: true
                }}
            />

            {/* Rating Breakdown */}
            {!isDrilledDown && (
                <div className="card">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Rating Breakdown</h4>
                    <div className="space-y-3">
                        {chartData.map((rating, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex">
                                        {renderStars(rating.rating)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{rating.name}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${rating.sentiment === 'positive' ? 'bg-green-500' :
                                                rating.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`}
                                            style={{
                                                width: `${(rating.value / feedbackStats.totalResponses) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-8">{rating.value}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(rating.sentiment)}`}>
                                        {rating.sentiment}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detailed Feedback */}
            {isDrilledDown && drillDownData && (
                <div className="card">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Comments</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {drillDownData.map((feedback, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-900">{feedback.customer}</span>
                                        <div className="flex">
                                            {renderStars(feedback.rating)}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(feedback.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700">{feedback.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerFeedbackChart;
