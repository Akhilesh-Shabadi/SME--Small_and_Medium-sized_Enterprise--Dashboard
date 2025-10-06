import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import {
    PencilIcon,
    TrashIcon,
    ArrowUturnLeftIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const CommentItem = ({
    comment,
    replies = [],
    onUpdate,
    onDelete,
    onReply,
    isEditing,
    onEdit,
    onCancelEdit
}) => {
    const { user } = useSelector((state) => state.auth);
    const [editContent, setEditContent] = useState(comment.content);
    const [showReplies, setShowReplies] = useState(true);

    const isOwner = comment.userId === user.id;
    const canEdit = isOwner;
    const canDelete = isOwner;

    const handleUpdate = () => {
        if (editContent.trim() && editContent !== comment.content) {
            onUpdate(comment.id, editContent.trim());
        } else {
            onCancelEdit();
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            onDelete(comment.id);
        }
    };

    const handleReply = () => {
        onReply(comment.id);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                            {comment.user?.firstName?.charAt(0) || 'U'}
                        </span>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                            {comment.user?.firstName} {comment.user?.lastName}
                        </p>
                        <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                        </span>
                        {comment.isEdited && (
                            <span className="text-xs text-gray-400">(edited)</span>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="mt-2 space-y-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Edit your comment..."
                            />
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleUpdate}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <CheckIcon className="h-4 w-4 mr-1" />
                                    Save
                                </button>
                                <button
                                    onClick={onCancelEdit}
                                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <XMarkIcon className="h-4 w-4 mr-1" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-1">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {comment.content}
                            </p>

                            {comment.mentions && comment.mentions.length > 0 && (
                                <div className="mt-2">
                                    <span className="text-xs text-gray-500">Mentioned: </span>
                                    {comment.mentions.map((mention, index) => (
                                        <span key={index} className="text-xs text-blue-600">
                                            @{mention}
                                            {index < comment.mentions.length - 1 && ', '}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!isEditing && (
                        <div className="mt-2 flex items-center space-x-4">
                            <button
                                onClick={handleReply}
                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                            >
                                <ArrowUturnLeftIcon className="h-3 w-3 mr-1" />
                                Reply
                            </button>

                            {canEdit && (
                                <button
                                    onClick={onEdit}
                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                                >
                                    <PencilIcon className="h-3 w-3 mr-1" />
                                    Edit
                                </button>
                            )}

                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="text-xs text-red-500 hover:text-red-700 flex items-center"
                                >
                                    <TrashIcon className="h-3 w-3 mr-1" />
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Replies */}
            {replies.length > 0 && (
                <div className="mt-4 ml-8">
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="text-sm text-gray-500 hover:text-gray-700 mb-2"
                    >
                        {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                    </button>

                    {showReplies && (
                        <div className="space-y-3">
                            {replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    onUpdate={onUpdate}
                                    onDelete={onDelete}
                                    onReply={onReply}
                                    isEditing={false}
                                    onEdit={() => { }}
                                    onCancelEdit={() => { }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
