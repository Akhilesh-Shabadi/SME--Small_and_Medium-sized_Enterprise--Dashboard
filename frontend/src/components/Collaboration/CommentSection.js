import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../../contexts/SocketContext';
import { addComment, updateComment, removeComment } from '../../store/slices/collaborationSlice';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import LoadingSpinner from '../UI/LoadingSpinner';

const CommentSection = ({ widgetId }) => {
    const dispatch = useDispatch();
    const { comments, isLoading } = useSelector((state) => state.collaboration);
    const { user } = useSelector((state) => state.auth);
    const { createComment, updateComment: updateCommentSocket, deleteComment } = useSocket();
    const [showForm, setShowForm] = useState(false);
    const [editingComment, setEditingComment] = useState(null);

    // Filter comments for this widget
    const widgetComments = comments.filter(comment => comment.widgetId === widgetId);

    useEffect(() => {
        // Socket event listeners are handled in SocketContext
        // The comments will be updated through Redux actions
    }, []);

    const handleCreateComment = async (commentData) => {
        try {
            const newComment = {
                id: Date.now().toString(), // Temporary ID
                widgetId,
                content: commentData.content,
                parentId: commentData.parentId,
                mentions: commentData.mentions || [],
                userId: user.id,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar
                },
                timestamp: new Date().toISOString(),
                isEdited: false,
                isDeleted: false
            };

            // Add to Redux store immediately for optimistic update
            dispatch(addComment(newComment));

            // Send to socket for real-time updates
            createComment(newComment);

            setShowForm(false);
        } catch (error) {
            console.error('Error creating comment:', error);
        }
    };

    const handleUpdateComment = async (commentId, content) => {
        try {
            const updatedComment = {
                id: commentId,
                content,
                isEdited: true,
                editedAt: new Date().toISOString()
            };

            // Update in Redux store
            dispatch(updateComment(updatedComment));

            // Send to socket for real-time updates
            updateCommentSocket({
                widgetId,
                commentId,
                content
            });

            setEditingComment(null);
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            // Remove from Redux store
            dispatch(removeComment(commentId));

            // Send to socket for real-time updates
            deleteComment({
                widgetId,
                commentId
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleReply = (parentId) => {
        setShowForm(true);
        // You can pass parentId to the form if needed
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Comments ({widgetComments.length})
                </h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary text-sm"
                >
                    {showForm ? 'Cancel' : 'Add Comment'}
                </button>
            </div>

            {showForm && (
                <CommentForm
                    onSubmit={handleCreateComment}
                    onCancel={() => setShowForm(false)}
                    placeholder="Add a comment..."
                />
            )}

            <div className="space-y-4">
                {widgetComments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    widgetComments
                        .filter(comment => !comment.parentId) // Only top-level comments
                        .map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                replies={widgetComments.filter(reply => reply.parentId === comment.id)}
                                onUpdate={handleUpdateComment}
                                onDelete={handleDeleteComment}
                                onReply={handleReply}
                                isEditing={editingComment === comment.id}
                                onEdit={() => setEditingComment(comment.id)}
                                onCancelEdit={() => setEditingComment(null)}
                            />
                        ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
