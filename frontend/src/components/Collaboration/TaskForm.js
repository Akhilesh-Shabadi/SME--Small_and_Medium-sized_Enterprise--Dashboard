import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PlusIcon } from '@heroicons/react/24/outline';

const TaskForm = ({ onSubmit, onCancel, widgetId, dashboardId }) => {
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm();

    const handleFormSubmit = (data) => {
        onSubmit({
            title: data.title,
            description: data.description,
            assignedTo: data.assignedTo,
            priority: data.priority,
            dueDate: data.dueDate,
            tags: tags,
            metadata: {}
        });
        reset();
        setTags([]);
        setTagInput('');
    };

    const handleCancel = () => {
        reset();
        setTags([]);
        setTagInput('');
        onCancel();
    };

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
                <label className="label">Task Title</label>
                <input
                    {...register('title', {
                        required: 'Task title is required',
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
                    placeholder="Enter task title"
                />
                {errors.title && (
                    <p className="error-message">{errors.title.message}</p>
                )}
            </div>

            <div>
                <label className="label">Description</label>
                <textarea
                    {...register('description', {
                        maxLength: {
                            value: 1000,
                            message: 'Description must be less than 1000 characters'
                        }
                    })}
                    className="input"
                    rows={3}
                    placeholder="Enter task description (optional)"
                />
                {errors.description && (
                    <p className="error-message">{errors.description.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">Assign To</label>
                    <select
                        {...register('assignedTo', {
                            required: 'Please select an assignee'
                        })}
                        className="input"
                    >
                        <option value="">Select assignee</option>
                        {/* In a real app, this would be populated from API */}
                        <option value="user1">John Doe</option>
                        <option value="user2">Jane Smith</option>
                        <option value="user3">Bob Johnson</option>
                    </select>
                    {errors.assignedTo && (
                        <p className="error-message">{errors.assignedTo.message}</p>
                    )}
                </div>

                <div>
                    <label className="label">Priority</label>
                    <select
                        {...register('priority')}
                        className="input"
                        defaultValue="medium"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="label">Due Date</label>
                <input
                    {...register('dueDate')}
                    type="date"
                    className="input"
                />
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <label className="label">Tags</label>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tag"
                        className="flex-1 input"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        <PlusIcon className="h-4 w-4" />
                    </button>
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
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
                    className="btn btn-outline"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    Create Task
                </button>
            </div>
        </form>
    );
};

export default TaskForm;
