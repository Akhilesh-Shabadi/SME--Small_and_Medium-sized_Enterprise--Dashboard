import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

const CommentForm = ({ onSubmit, onCancel, placeholder = "Write a comment..." }) => {
    const [mentions, setMentions] = useState([]);
    const [mentionText, setMentionText] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm();

    const content = watch('content', '');

    const handleFormSubmit = (data) => {
        onSubmit({
            content: data.content,
            mentions: mentions
        });
        reset();
        setMentions([]);
        setMentionText('');
    };

    const handleCancel = () => {
        reset();
        setMentions([]);
        setMentionText('');
        onCancel();
    };

    const addMention = () => {
        if (mentionText.trim() && !mentions.includes(mentionText.trim())) {
            setMentions([...mentions, mentionText.trim()]);
            setMentionText('');
        }
    };

    const removeMention = (mention) => {
        setMentions(mentions.filter(m => m !== mention));
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
                <textarea
                    {...register('content', {
                        required: 'Comment content is required',
                        minLength: {
                            value: 1,
                            message: 'Comment must be at least 1 character'
                        },
                        maxLength: {
                            value: 2000,
                            message: 'Comment must be less than 2000 characters'
                        }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder={placeholder}
                />
                {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
            </div>

            {/* Mentions */}
            <div className="space-y-2">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={mentionText}
                        onChange={(e) => setMentionText(e.target.value)}
                        placeholder="Add mention (e.g., @john)"
                        className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMention())}
                    />
                    <button
                        type="button"
                        onClick={addMention}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Add
                    </button>
                </div>

                {mentions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {mentions.map((mention, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                                @{mention}
                                <button
                                    type="button"
                                    onClick={() => removeMention(mention)}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!content.trim()}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    Post Comment
                </button>
            </div>
        </form>
    );
};

export default CommentForm;
